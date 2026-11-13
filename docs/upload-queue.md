# useUploadQueue - queue d'uploads offline-first

Hook React exposé par `@cap-rel/smartcommon`. Permet de mettre en file un blob
(photo, fichier joint, ...) même si le réseau est coupé, de le persister
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
                                  | tency (spec, section 14)|
                                  +-------------------------+
```

## API

```javascript
import { useUploadQueue } from "@cap-rel/smartcommon";

const {
    enqueue,      // async (blob, meta?, { pendingId }?) => { pending_id }
    pending,      // Array<PendingUpload>
    retry,        // (pending_id) => Promise<void>
    cancel,       // (pending_id) => Promise<void>
    flush,        // () => Promise<void>
    onResolved,   // (cb) => unsubscribe
} = useUploadQueue({
    endpoint: "upload",     // override si le module réexpose la route
    maxRetries: 10,         // cap des tentatives auto
    backoffBaseMs: 1000,    // backoff: 1s, 2s, 4s, ...
    backoffCapMs: 60000,    // borne haute
});
```

### Type `PendingUpload`

| Champ | Type | Notes |
|-------|------|-------|
| pending_id | string | UUID v4 généré localement |
| filename | string | |
| mime | string | |
| size | number | bytes |
| status | string | `idle` \| `uploading` \| `failed` \| `resolved` |
| attempts | number | incrémenté à chaque échec qui sera retenté |
| lastError | string \| null | message court |
| lastErrorType | string \| null | `network` \| `http_4xx` \| `http_5xx` \| `max_retries` |
| upload_id | string \| null | rempli quand `status === "resolved"` |
| meta | object | libre, passé par l'appelant |
| createdAt | number | unix seconds |
| updatedAt | number | unix seconds |

Le blob n'est pas exposé dans la snapshot React (les consommateurs n'en ont
pas besoin et il est lourd à sérialiser dans le store). Il reste persisté en
IDB.

## États et transitions

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

`http_4xx` n'est PAS réinitialisé à la reconnexion (c'est un problème métier,
pas réseau). L'appelant doit corriger le payload puis appeler `retry(pid)`.

## Exemple d'intégration dans un formulaire

```javascript
import { useEffect, useState } from "react";
import { useUploadQueue } from "@cap-rel/smartcommon";

const InterventionForm = ({ interventionId }) => {
    const { enqueue, onResolved } = useUploadQueue();
    const [photos, setPhotos] = useState([]); // [{ pending_id?, upload_id?, previewUrl }]

    // Reconcile pending_id -> upload_id quand le serveur a accepté.
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
            json: { photo_upload_ids: photos.map(p => p.upload_id) },
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
- Après résolution, la ligne est supprimée d'IDB. Aucune rétention.
- Au montage du hook, hydratation : les lignes non `resolved` d'une session
  précédente sont rechargées, les lignes orphelines `resolved` (crash entre
  notification et purge) sont supprimées silencieusement.

## Contrat backend smartAuth

Le hook envoie `Idempotency-Key: <pending_id>` sur chaque tentative
(même clé pour tous les retries du même blob). Le backend doit dédoublonner
via une table `upload_idempotency` :

- clé absente -> traitement normal, réponse conservée 24h.
- clé déjà vue, `completed` -> retour 200 + même `upload_id` que la
  première fois, **sans** retraiter le fichier.
- clé vue, `processing` -> retour `409 Conflict` avec
  `{ retry_after_ms: 2000 }`. Le client attend puis retente sans
  incrémenter `attempts`.

Spécification complète : section 14 du fichier `docs/internal/spec-uploadqueue.md`
de ce dépôt.

## Mode `useUpload({ queue: true })`

Pour les modules qui utilisent déjà `useUpload`, il suffit d'ajouter
l'option `queue: true` pour rerouter l'upload via la queue :

```javascript
const { uploadFile } = useUpload({ queue: true });

// Retour toujours { upload_id, pending_id, filename, mime, size, ... }
// - online + succès  -> { upload_id: "abc", pending_id: null, ... }
// - offline / 5xx / 409 / network -> { upload_id: null, pending_id, ... }
// - autre 4xx        -> throw
const { upload_id, pending_id } = await uploadFile(file);
```

L'option `queue: false` (défaut) garde le comportement legacy strict :
pas d'IDB, pas de header `Idempotency-Key`, pas de champ `pending_id`
dans la réponse.

## Réinitialisation des états (tests)

Le module expose `__resetUploadQueueForTests()` (préfixe `__` = usage
interne / tests uniquement). Il vide la queue en mémoire, annule les
timers de retry et vide la table IDB de la queue (la base reste). NE PAS
appeler en runtime.

## Références

- Spec complète (incluant le contrat backend smartAuth) :
  `docs/internal/spec-uploadqueue.md`.
- Doc transverse upload PWA : `capdoc:UPLOAD_PWA.md`.
