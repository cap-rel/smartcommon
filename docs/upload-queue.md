# useUploadQueue - queue d'uploads offline-first

Hook React expose par `@cap-rel/smartcommon`. Permet d'enqueue un blob
(photo, fichier joint, ...) meme si le reseau est coupe, de le persister
en IndexedDB et de le pousser vers `/upload` automatiquement quand la
connexion revient.

## Vue d'ensemble

```
+----------------+   enqueue(blob)   +------------------+
|  composant UI  +------------------>+ smartcommon-     |
| (PhotosUploader|                   | uploads-queue    |
|  / custom)     |<--onResolved-----+ (IDB singleton)  |
+----------------+                   +--------+---------+
                                              |
                                              | POST /upload
                                              | Idempotency-Key: <pending_id>
                                              v
                                  +-------------------------+
                                  | smartAuth UploadCtrl    |
                                  | + table upload_idempo-  |
                                  | tency (cf §14 spec)     |
                                  +-------------------------+
```

## API

```javascript
import { useUploadQueue } from "@cap-rel/smartcommon";

const {
    enqueue,      // async (blob, meta?) => { pending_id }
    pending,      // Array<PendingUpload>
    retry,        // (pending_id) => Promise<void>
    cancel,       // (pending_id) => Promise<void>
    flush,        // () => Promise<void>
    onResolved,   // (cb) => unsubscribe
} = useUploadQueue({
    endpoint: "upload",     // override si le module re-expose la route
    maxRetries: 10,         // cap des tentatives auto
    backoffBaseMs: 1000,    // backoff: 1s, 2s, 4s, ...
    backoffCapMs: 60000,    // borne haute
});
```

### Type `PendingUpload`

| Champ | Type | Notes |
|-------|------|-------|
| pending_id | string | UUID v4 genere localement |
| filename | string | |
| mime | string | |
| size | number | bytes |
| status | string | `idle` \| `uploading` \| `failed` \| `resolved` |
| attempts | number | incremente sur chaque echec retentable |
| lastError | string \| null | message court |
| lastErrorType | string \| null | `network` \| `http_4xx` \| `http_5xx` \| `max_retries` \| `quota` |
| upload_id | string \| null | rempli quand `status === "resolved"` |
| meta | object | libre, passe par le caller |
| createdAt | number | unix seconds |
| updatedAt | number | unix seconds |

Le blob n'est pas expose dans la snapshot React (consumers n'en ont pas
besoin et c'est lourd a serialiser dans le store). Il reste persiste en
IDB.

## Etats et transitions

```
                +--------+
                |  idle  |<------------+
                +---+----+             |
                    |                  |
              enqueue                  |  online + flush
                    |                  |
                    v                  |
                +--------+   2xx   +---+----+
                |uploadi-+-------->| resolved|--+
                |ng      |         +--------+  |
                +----+---+                     | onResolved
                     |                         | puis purge IDB
            4xx |    | 5xx / network          |
                v    v                         v
        +--------+  +--------+             [deleted]
        |failed  |  |failed  |
        |http_4xx|  |network |
        +--------+  |/5xx    |  ...max_retries
                    +---+----+
                        |
                        +---retry(pid) / online event--> idle
```

`http_4xx` ne se reset PAS sur reconnexion (c'est un probleme metier, pas
reseau). Le caller doit corriger le payload puis appeler `retry(pid)`.

## Exemple d'integration dans un form

```javascript
import { useEffect, useState } from "react";
import { useUploadQueue } from "@cap-rel/smartcommon";

const InterventionForm = ({ interventionId }) => {
    const { enqueue, onResolved } = useUploadQueue();
    const [photos, setPhotos] = useState([]); // [{ pending_id?, upload_id?, previewUrl }]

    // Reconcile pending_id -> upload_id quand le serveur a accepte.
    useEffect(() => onResolved(({ pending_id, upload_id }) => {
        setPhotos(ps => ps.map(p =>
            p.pending_id === pending_id
                ? { ...p, pending_id: null, upload_id }
                : p
        ));
    }), []);

    const onPickPhoto = async (blob) => {
        const previewUrl = URL.createObjectURL(blob);
        const { pending_id } = await enqueue(blob, { interventionId });
        setPhotos(ps => [...ps, { pending_id, previewUrl }]);
    };

    const submit = async () => {
        if (photos.some(p => p.pending_id && !p.upload_id)) {
            // Toast / draft / attendre (au choix).
            return;
        }
        await api.put(`intervention/${interventionId}`, {
            photo_upload_ids: photos.map(p => p.upload_id),
        });
    };

    // ...
};
```

Ou, plus simple : passer par `<PhotosUploader queue outputFormat="upload">`
qui fait toute la plomberie ci-dessus.

## Quotas et garbage collection

- Avant chaque `enqueue`, le hook lit `navigator.storage.estimate()`. Si
  l'espace libre est < 10 MB, `enqueue` throw une `Error` avec
  `name === "QuotaExceededError"`. Le caller affiche un toast et propose
  de faire de la place (cf [offline.md](offline.md) - utilitaires
  storage).
- Apres resolution, la row est supprimee de IDB. Aucune retention.
- Au mount du hook, hydratation : les rows non-`resolved` d'une session
  precedente sont rechargees, les rows orphelines `resolved` (crash entre
  notification et purge) sont supprimees silencieusement.

## Contrat backend smartAuth

Le hook envoie `Idempotency-Key: <pending_id>` sur chaque tentative
(meme cle pour tous les retries du meme blob). Le backend doit dedoublonner
via une table `upload_idempotency` :

- cle absente -> traitement normal, store de la reponse pour 24h.
- cle deja vue, `completed` -> retour 200 + meme `upload_id` que la
  premiere fois, **sans** re-traiter le fichier.
- cle vue, `processing` -> retour `409 Conflict` avec
  `{ retry_after_ms: 2000 }`. Le client attend puis re-tente sans
  incrementer `attempts`.

Specification complete : section 14 du fichier `docs/internal/spec-uploadqueue.md`
du present repo.

## Mode `useUpload({ queue: true })`

Pour les modules qui utilisent deja `useUpload`, il suffit d'ajouter
l'option `queue: true` pour rerouter l'upload via la queue :

```javascript
const { uploadFile } = useUpload({ queue: true });

// Retour toujours { upload_id, pending_id, filename, mime, size, ... }
// - online + succes  -> { upload_id: "abc", pending_id: null, ... }
// - offline / 5xx / network -> { upload_id: null, pending_id, ... }
// - 4xx              -> throw
const { upload_id, pending_id } = await uploadFile(file);
```

L'option `queue: false` (defaut) garde le comportement legacy strict :
pas d'IDB, pas de header `Idempotency-Key`, pas de champ `pending_id`
dans la reponse.

## Reset des etats (tests)

Le module expose `__resetUploadQueueForTests()` (prefixe `__` = usage
interne / tests uniquement). Il vide la queue en memoire, annule les
timers de retry et supprime la DB IDB. NE PAS appeler en runtime.

## References

- Spec complete (incluant le contrat backend smartAuth) :
  `docs/internal/spec-uploadqueue.md`.
- Doc transverse upload PWA : `~/docs/UPLOAD_PWA.md`.
