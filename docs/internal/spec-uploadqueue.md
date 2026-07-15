# Spec - useUploadQueue (offline-first uploads)

Statut : proposition validée, prête à implémenter (révision 2).
Cible : `@cap-rel/smartcommon` (la lib React partagée par toutes les PWAs Dolibarr CAP-REL : smartInterventions, capTodo, capCRM, eTicket, doliCollect, scanInvoices, etc.).
Auteur de la demande : équipe SmartInterventions.
Document destiné à un agent autonome : pas de contexte conversationnel implicite, tout ce qui suit doit suffire à coder.

## Historique des révisions

- v1 : version initiale.
- v2 (2026-05-11) : 4 décisions actées avant implémentation :
  1. `enqueue` devient async (retourne `Promise<{pending_id}>`) pour awaiter l'écriture IDB et le check quota : plus de fenêtre de perte entre retour et persistance.
  2. Retour de `useUpload({queue:true})` unifié à `{upload_id, pending_id}` avec un des deux toujours à `null`. Invariant unique côté caller.
  3. Header `Idempotency-Key: <pending_id>` envoyé sur chaque tentative. Contrat backend smartAuth détaillé en section 14.
  4. Ajout du champ `lastErrorType` à la row IDB (`network` / `http_4xx` / `http_5xx` / `max_retries` / `quota`) pour permettre un reset sélectif à la reconnexion.

  Le périmètre `<SignaturePad>` reste dans la spec (cf §3.4 et §13) mais est marqué **phase 2** : pas implémenté dans la PR initiale, mêmes garanties applicables ensuite sans changer la queue.

- v3 (2026-05-11) : phase 2 `<SignaturePad>` livrée (cf §3.4). Aucun changement sur la queue ni sur `useUpload`, l'intégration consomme l'API publique telle quelle. Pas de breaking change sur le mode `outputFormat="dataURL"` (défaut).

## 1. Contexte et problème

Aujourd'hui dans smartcommon, [src/lib/hooks/global/useUpload/index.jsx](../../src/lib/hooks/global/useUpload/index.jsx) fait un `api.post('upload', { body: formData })` synchrone. Si l'utilisateur est offline au moment où il prend une photo :

- le `POST /upload` échoue immédiatement,
- le caller ne reçoit pas d'`upload_id`,
- le blob est perdu, même si l'app a un mécanisme de drafts.

Concrètement, dans smartInterventions, [mobile/src/components/pages/private/FormPage/index.jsx](../../../smartInterventions/mobile/src/components/pages/private/FormPage/index.jsx) :

- helper `dataUrlToUploadId` (lignes 19-30) qui appelle `uploadFile` puis renvoie `upload_id`,
- au submit, les photos sont uploadées une par une avant le `PUT /intervention/{id}`,
- si offline, `dataUrlToUploadId` throw, le submit fail, le user ressaie en pensant que c'est sauvé.

Le besoin est partagé par toutes les PWAs métier. La logique doit donc vivre dans smartcommon, pas dans chaque module.

## 2. Objectifs

1. Un blob (photo, fichier joint) peut être enqueue offline et persisté dans IndexedDB.
2. La queue se vide automatiquement quand la connexion revient (via `useOnlineStatus`).
3. Le caller reçoit un `pending_id` (UUID local) **après que l'écriture IDB ait été awaitée**, puis plus tard un `upload_id` (côté serveur) via callback.
4. Aucune régression sur les usages existants de `useUpload` : nouvelle API opt-in via flag, le mode "post direct" actuel reste le défaut.
5. Le composant existant `<PhotosUploader>` peut intégrer la queue de façon transparente via une prop.

Non-objectifs (à ne pas implémenter dans cette PR, mais spécifiés pour la phase 2) :

- `<SignaturePad>` : extension décrite en §3.4. Nécessite aussi l'ajout d'un nouvel `outputFormat="upload"` (n'existe pas aujourd'hui). Pas implémenté dans la PR initiale pour ne pas mélanger l'ajout de la queue et l'ajout d'un nouveau mode d'output. La queue conçue ici doit suffire telle quelle pour le brancher en phase 2.

Non-objectifs durables (jamais dans cette spec) :

- Outbox générique pour les PUT/POST métier (PUT /intervention/{id} qui référence des upload_id). Chaque module gère ça via ses drafts.
- Résolution de conflits, ordering inter-modules, dead-letter queue.

## 3. API publique

### 3.1 Hook `useUploadQueue`

Nouveau fichier : `src/lib/hooks/global/useUploadQueue/index.jsx`.
Export depuis : `src/lib/hooks/global/index.js` et `src/lib/hooks/global/export.js`.

```javascript
const {
    enqueue,        // async (blob: Blob, meta?: object) => { pending_id: string }
    pending,        // Array<PendingUpload>
    retry,          // (pending_id: string) => Promise<void>
    cancel,         // (pending_id: string) => Promise<void>
    flush,          // () => Promise<void>   force une tentative immediate
    onResolved,     // (cb: ({ pending_id, upload_id, meta }) => void) => unsubscribe
} = useUploadQueue({ endpoint = "upload", maxRetries = 10, backoffBaseMs = 1000, backoffCapMs = 60000 } = {});
```

Type `PendingUpload` :

```
{
    pending_id: string,              // UUID v4 généré localement (crypto.randomUUID())
    filename: string,
    mime: string,
    size: number,
    status: "idle" | "uploading" | "failed" | "resolved",
    attempts: number,
    lastError: string | null,        // message court
    lastErrorType: "network" | "http_4xx" | "http_5xx" | "max_retries" | "quota" | null,
    upload_id: string | null,        // rempli quand status === "resolved"
    meta: object,                    // libre, fourni par le caller (ex: { interventionId, field })
    createdAt: number,               // unix seconds
    updatedAt: number,
}
```

Contrats :

- `enqueue` est **async**. Il :
  1. valide que `blob` est bien un Blob/File ; sinon throw `TypeError`.
  2. vérifie le quota disponible via `navigator.storage.estimate()` ; si quota libre < 10 MB, throw une `Error` avec `name === "QuotaExceededError"`.
  3. génère un `pending_id` (`crypto.randomUUID()`), écrit la row en IDB (await),
  4. retourne `{ pending_id }`,
  5. déclenche en background une tentative d'upload si online (ne pas await).
- `enqueue` throw uniquement sur (a) blob invalide, (b) quota dépassé, (c) écriture IDB impossible. Pas de fallback en mémoire dans cette version : on privilégie un échec explicite plutôt qu'un faux offline-first.
- `flush` est idempotent. Appelé automatiquement quand `useOnlineStatus.isOnline` passe à `true`, et au mount du provider après hydratation.
- `onResolved` est l'unique mécanisme pour réagir à la fin d'un upload. Les composants doivent l'utiliser pour patcher leur form value (`pending_id` -> `upload_id`). Retourne une fonction `unsubscribe`.
- Le hook doit être safe à appeler depuis plusieurs composants en parallèle : la queue est un singleton applicatif (module-level state + `useSyncExternalStore` côté React, ou `useGlobalStates`).

### 3.2 `useUpload` modifié

Fichier : [src/lib/hooks/global/useUpload/index.jsx](../../src/lib/hooks/global/useUpload/index.jsx).

Ajouter un flag `queue` dans les options :

```javascript
const { uploadFile } = useUpload({ queue: true });
// Retour TOUJOURS (forme unifiée) :
//   { upload_id: string|null, pending_id: string|null, filename, mime, size, ... }
// - online + succès        -> { upload_id: "abc", pending_id: null, filename, mime, size, ... }
// - offline ou réseau KO   -> { upload_id: null,   pending_id: "uuid", filename, mime, size }
// - 5xx                    -> idem offline (enqueue + retry async)
// - 4xx                    -> throw (validation serveur, pas de retry)
```

Quand `queue: false` (défaut) : comportement actuel **exactement**, zéro changement. Le retour reste celui d'aujourd'hui (pas de champ `pending_id` ajouté, pas d'appel à IDB, pas de header `Idempotency-Key`). Test explicite : assertion que les anciens callers ne sont pas impactés.

Quand `queue: true` :

- générer le `pending_id` (`crypto.randomUUID()`) **avant** la tentative directe, pour pouvoir l'envoyer comme `Idempotency-Key`.
- tenter le POST avec le header `Idempotency-Key: <pending_id>` si online.
- si succès 2xx : retourner `{ upload_id, pending_id: null, filename, mime, size, ... }`. Le `pending_id` généré est jeté (il n'a jamais été persisté).
- si offline (`navigator.onLine === false`), erreur réseau (`TypeError` / "Failed to fetch") ou 5xx : appeler `useUploadQueue().enqueue(file, meta)` en passant le `pending_id` déjà généré pour préserver la chaîne d'idempotence, et retourner `{ upload_id: null, pending_id, filename, mime, size }`.
- si 4xx : throw normalement.

### 3.3 `<PhotosUploader>`

Fichier : [src/lib/components/form/PhotosUploader/](../../src/lib/components/form/PhotosUploader/).

Quand `outputFormat="upload"` et nouvelle prop `queue={true}` :

- en cas d'upload offline / différé, stocker localement la vignette (`URL.createObjectURL`) + le `pending_id`,
- afficher un badge "en attente" sur la vignette,
- quand `onResolved` est émis avec le bon `pending_id`, remplacer en interne `pending_id` par `upload_id` et notifier le form via le `onChange` habituel.

Avec `queue={false}` (défaut) : comportement actuel inchangé.

### 3.4 `<SignaturePad>` (phase 2 livrée)

Fichier : [src/lib/components/form/SignaturePad/index.jsx](../../src/lib/components/form/SignaturePad/index.jsx).

Deux ajouts implémentés conjointement :

1. **Nouveau mode `outputFormat="upload"`** (`"dataURL"` reste le défaut, comportement legacy strictement préservé).
2. **Prop `queue={true}`** analogue à celle de `<PhotosUploader>`, plus `uploadEndpoint` et `onUploadError`.

Comportement effectif :

- Le bouton "Valider la signature" (FaSignature) était jusqu'ici `opacity-0` / no-op. Il devient visible uniquement quand `outputFormat="upload"` et déclenche l'upload sur clic. En mode dataURL il reste invisible (compat).
- Sur validate : `padRef.off()`, `canvas.toBlob("image/png")`, `uploadFile(blob, { filename: "signature.png" })` avec `queue: queueMode`. Le `meta` n'est pas transporté par défaut (le caller peut wrapper s'il en a besoin).
- Le retour est patché dans la value : `{ src: dataURL_pour_preview, signer, gpsPoints, uploadId, pendingId }`. La dataURL est conservée pour pouvoir afficher la signature localement sans la re-télécharger.
- Subscription à `useUploadQueue().onResolved` : quand un `pending_id` correspond à celui de la signature, `pendingId` est swappé pour le vrai `uploadId`.
- Badge "Envoi en attente..." affiché juste sous le canvas quand `pendingId !== null`.
- Sur erase : si `pendingId` est set -> `uploadQueue.cancel(pendingId)`. Si `uploadId` est set -> `cancelUpload(uploadId)` (best-effort, le staging serveur a son propre TTL). Puis reset complet du value.
- Validation `required` : en mode upload, c'est la présence d'`uploadId` (ou d'un `pendingId` en cours) qui valide le champ, pas la dataURL.

Avec `outputFormat="dataURL"` (défaut) : tout le code upload est court-circuité, ni `useUpload` ni `useUploadQueue` ne sont effectivement appelés (hooks conditionnels avec `eslint-disable react-hooks/rules-of-hooks` car `outputFormat` est stable par instance).

## 4. Stockage IndexedDB

Utiliser `useDb` existant ([src/lib/hooks/local/useDb/index.jsx](../../src/lib/hooks/local/useDb/index.jsx)) si possible, sinon Dexie directement (il est déjà en deps).

Nom de db : `smartcommon-uploads-queue` (singleton, partagé entre toutes les apps qui montent smartcommon dans le même origin).

Object store unique : `uploads_pending`

| Champ | Type | Index | Notes |
|-------|------|-------|-------|
| pending_id | string | primary | UUID v4 |
| blob | Blob | - | stocké nativement par IDB |
| filename | string | - | |
| mime | string | - | |
| size | number | - | bytes |
| status | string | indexed | idle/uploading/failed/resolved |
| attempts | number | - | |
| lastError | string\|null | - | message court |
| lastErrorType | string\|null | indexed | network/http_4xx/http_5xx/max_retries/quota |
| upload_id | string\|null | - | rempli à la résolution |
| meta | object | - | libre |
| createdAt | number | indexed | unix seconds |
| updatedAt | number | - | unix seconds |

Hydratation : au premier mount du provider, charger tous les rows non-`resolved` et tenter `flush` si online.

Purge : les rows `status === "resolved"` sont supprimées **après** notification de tous les abonnés `onResolved`. Pas de rétention. Si le caller veut tracer, il le fait dans son propre store.

Quotas : vérifier `navigator.storage.estimate()` à chaque `enqueue` (await). Si `quota - usage < 10 MB`, `enqueue` throw une error `name === "QuotaExceededError"`. Une row "rejetée pour quota" n'est pas créée en IDB.

## 5. Stratégie de retry

- Tentative initiale immédiate après `enqueue` si online (background, ne bloque pas le retour de `enqueue`).
- Header `Idempotency-Key: <pending_id>` sur chaque tentative (contrat backend section 14). La valeur reste constante pour toutes les tentatives d'un même `pending_id`.
- En cas d'échec réseau (`TypeError` / fetch failed) : `lastErrorType = "network"`, backoff exponentiel `min(backoffCapMs, backoffBaseMs * 2^attempts)`. Defaults : 1s, 2s, 4s, ..., cap 60s.
- En cas d'échec HTTP 4xx : `lastErrorType = "http_4xx"`, status `failed`, **plus de retry auto** (le caller doit `retry(pending_id)` manuellement après correction). Log `console.error` avec le statut.
- En cas d'échec HTTP 5xx : `lastErrorType = "http_5xx"`, retry comme une erreur réseau.
- En cas d'échec HTTP 409 (idempotency en cours côté backend, cf §14) : ne pas incrémenter `attempts`, retry après `retry_after_ms` du body (fallback 2000 ms si absent). Conserver `lastErrorType = null` ou la valeur précédente : ce n'est pas un échec.
- `maxRetries` atteint : `lastErrorType = "max_retries"`, status `failed`, plus de retry auto. Visible dans `pending` pour UI de gestion.
- À la transition offline -> online (via `useOnlineStatus`), reset `attempts = 0` pour les rows `failed` avec `lastErrorType IN ("network", "http_5xx", "max_retries")`, puis flush. Les rows `lastErrorType === "http_4xx"` restent telles quelles (problème métier, pas réseau).

## 6. Intégration côté modules (exemple smartInterventions)

À documenter dans la spec mais **pas à implémenter dans cette PR** (la PR cible smartcommon uniquement). Doc pour aider les agents qui intégreront ensuite.

Dans [smartInterventions/mobile/src/components/pages/private/FormPage/index.jsx](../../../smartInterventions/mobile/src/components/pages/private/FormPage/index.jsx) :

1. Supprimer `dataUrlToUploadId` local (lignes 19-30).
2. Remplacer `useUpload()` par `useUpload({ queue: true })`.
3. `<PhotosUploader queue>` (et en phase 2, `<SignaturePad queue outputFormat="upload">`).
4. Au submit, si le form contient des champs avec `upload_id: null` et un `pending_id` :
   - soit bloquer avec toast "uploads en cours, ressayez dans quelques secondes",
   - soit (recommandé) sauvegarder le PUT métier dans `useDbDrafts`, s'abonner à `onResolved` global, et resoumettre quand tous les `pending_id` du form ont été réconciliés.
5. Ajouter un badge global "N uploads en attente" dans la navbar/tabbar, fed par `useUploadQueue().pending.length`.

## 7. Tests

### 7.1 Tests unitaires Vitest (dans smartcommon)

Fichier : `src/lib/hooks/global/useUploadQueue/useUploadQueue.test.jsx` (suivre la convention vue dans [useUpload.test.jsx](../../src/lib/hooks/global/useUpload/useUpload.test.jsx)).

Dépendance dev à ajouter : `fake-indexeddb` (pour simuler IDB en environnement Node de Vitest).

Cas à couvrir :

- `enqueue` retourne (async) un `pending_id` non vide une fois la row écrite en IDB.
- `enqueue` persiste en IDB (vérifier via `db.uploads_pending.get`).
- `enqueue` throw `Error` avec `name === "QuotaExceededError"` si `navigator.storage.estimate` indique < 10 MB libre.
- `enqueue` throw `TypeError` si l'argument n'est pas un Blob/File.
- Online + réseau OK : `enqueue` résout, `onResolved` est appelé avec le bon `upload_id` et le `meta` original, row supprimée de IDB.
- Online + réseau KO : status passe à `failed` après backoff, `lastErrorType === "network"`, attempts incrémenté.
- Offline (mock `navigator.onLine = false`) : `enqueue` écrit en IDB mais ne tente pas de POST, status reste `idle`.
- Transition offline -> online (dispatch `window.dispatchEvent(new Event('online'))`) : `flush` est appelé, les rows sont réuploadées.
- HTTP 4xx : `lastErrorType === "http_4xx"`, status `failed`, **pas** de retry auto, `lastError` contient le code et le message.
- HTTP 5xx : `lastErrorType === "http_5xx"`, retry avec backoff comme réseau KO.
- HTTP 409 (idempotency in progress) : pas d'incrément `attempts`, retry après `retry_after_ms` du body.
- `maxRetries` atteint : `lastErrorType === "max_retries"`, status reste `failed`, plus de tentative.
- À la transition online : les `failed` avec `lastErrorType IN ("network","http_5xx","max_retries")` sont reset (attempts=0) et retryés ; les `http_4xx` restent intacts.
- Header `Idempotency-Key` : vérifier qu'il est présent sur la requête, égal au `pending_id`, et identique sur 2 tentatives consécutives.
- `cancel(pending_id)` : row supprimée de IDB, plus dans `pending`.
- `retry(pending_id)` manuel sur un `failed` : reset attempts, tente immédiatement.
- Plusieurs `enqueue` en parallèle : tous réussissent, ordre de résolution non garanti mais aucun n'est perdu.

Tests existants de `useUpload` : ajouter un cas qui vérifie que `useUpload({ queue: false })` (défaut) ne touche pas à IDB, ne génère pas de header `Idempotency-Key`, et garde le retour actuel sans champ `pending_id`.

Pour `useUpload({ queue: true })` : ajouter des cas qui vérifient
- online + succès : retour `{ upload_id, pending_id: null, ... }`, header `Idempotency-Key` présent ;
- offline : retour `{ upload_id: null, pending_id, ... }`, pas de POST, row en IDB ;
- 5xx : retour `{ upload_id: null, pending_id, ... }`, enqueue effectué ;
- 4xx : throw.

### 7.2 Tests d'intégration côté module (hors scope de cette PR)

À noter pour les futurs intégrateurs : un test Playwright E2E dans smartInterventions est attendu :

- couper le réseau Playwright (`page.context().setOffline(true)`),
- prendre une photo, soumettre,
- vérifier que le form est mis en draft / bloqué proprement,
- rallumer le réseau, attendre la résolution,
- vérifier côté backend que la photo est bien arrivée (et qu'elle n'a pas été dupliquée si le réseau a flappé pendant l'upload, cf §14).

Référence : `~/docs/TESTING_PWA.md`.

## 8. Documentation

- Mettre à jour [docs/offline.md](../offline.md) : ajouter `useUploadQueue` dans la table des exports et une section dédiée.
- Créer [docs/upload-queue.md](../upload-queue.md) avec :
  - explication offline-first,
  - exemple complet d'intégration dans un form,
  - schéma des états (`idle -> uploading -> resolved` / `idle -> failed -> retrying`),
  - quotas et garbage collection,
  - rappel du contrat backend (Idempotency-Key, section 14).
- Mettre à jour `~/docs/UPLOAD_PWA.md` (doc transverse cap-rel) : section "Mode offline-first" qui pointe vers smartcommon et vers le contrat backend smartAuth.

## 9. Versioning et migration

- Bump mineur `@cap-rel/smartcommon` : prochaine 1.1.0 (ou la version en cours +1 mineure si plus haut).
- Aucun breaking change sur l'API existante (flag `queue` opt-in).
- Modules qui dépendent de smartcommon n'ont rien à faire tant qu'ils ne passent pas `queue: true`.
- Côté smartAuth : ajout de la table `upload_idempotency` (cf §14.4), non bloquant pour les anciens clients (header `Idempotency-Key` optionnel côté backend).

## 10. Critères d'acceptation (definition of done)

1. `useUploadQueue` est exposé depuis `@cap-rel/smartcommon` et utilisable dans une PWA en suivant l'exemple de la section 6.
2. Tous les tests unitaires de la section 7.1 passent.
3. Les tests existants de `useUpload` continuent de passer sans modification (preuve de non-régression).
4. `<PhotosUploader queue>` fonctionne en démo (storybook ou page demo de smartcommon).
5. ESLint et `npm run build` de smartcommon passent.
6. Le bundle ne grossit pas de plus de ~5 KB gzip (Dexie déjà inclus, UUID v4 via `crypto.randomUUID()` natif, 0 KB).
7. Doc à jour : [docs/offline.md](../offline.md) et nouveau [docs/upload-queue.md](../upload-queue.md).
8. Changelog smartcommon mis à jour.

## 11. Fichiers clés à connaître avant de coder

| Fichier | Pourquoi |
|---------|----------|
| [src/lib/hooks/global/useUpload/index.jsx](../../src/lib/hooks/global/useUpload/index.jsx) | Implémentation actuelle de l'upload, à modifier pour le flag `queue` |
| [src/lib/hooks/global/useUpload/useUpload.test.jsx](../../src/lib/hooks/global/useUpload/useUpload.test.jsx) | Tests existants, modèle à suivre |
| [src/lib/hooks/local/useOnlineStatus.js](../../src/lib/hooks/local/useOnlineStatus.js) | Détection online/offline, à réutiliser |
| [src/lib/hooks/local/useDb/index.jsx](../../src/lib/hooks/local/useDb/index.jsx) | Wrapper Dexie existant, à réutiliser |
| [src/lib/components/form/PhotosUploader/index.jsx](../../src/lib/components/form/PhotosUploader/index.jsx) | À étendre avec prop `queue` |
| [src/lib/components/form/SignaturePad/index.jsx](../../src/lib/components/form/SignaturePad/index.jsx) | Phase 2 : à étendre avec `outputFormat="upload"` + prop `queue` |
| [src/lib/hooks/global/index.js](../../src/lib/hooks/global/index.js) | Index à mettre à jour pour exporter le nouveau hook |
| [src/lib/hooks/global/export.js](../../src/lib/hooks/global/export.js) | Idem |
| [docs/offline.md](../offline.md) | Doc transverse offline à compléter |

## 12. Hors-scope explicites

Hors-scope durable :

- Pas d'outbox métier (PUT/POST autres que /upload). Si demandé plus tard, autre PR.
- Pas de gestion multi-onglets : si conflit d'accès IDB, log et continuer.
- Pas de chiffrement at-rest des blobs en IDB.
- Pas de UI générique de gestion de la queue (liste, retry manuel, cancel). Chaque module fait son UI à partir de `pending`.

## 13. Effort estimé

PR initiale (smartcommon, sans SignaturePad) :

- Hook + IDB + retry : ~0.5 jour
- Intégration `useUpload` + tests : ~0.3 jour
- Extension `PhotosUploader` : ~0.2 jour
- Tests unitaires complets : ~0.3 jour
- Doc + changelog : ~0.1 jour

Total PR initiale : ~1.4 à 1.8 jours côté smartcommon.

Phase 2 (à part) :

- Extension `<SignaturePad>` (`outputFormat="upload"` + `queue`) : ~0.4 jour.

Côté smartAuth (cf §14, bloquant pour l'idempotence end-to-end) : ~0.5 à 1 jour (table + middleware + tests).

## 14. Contrat backend smartAuth - endpoint `/upload`

**À implémenter côté smartAuth, hors scope de la PR smartcommon mais nécessaire pour avoir une vraie idempotence end-to-end.** Sans cette partie, un retry après succès partiel (réseau coupé avant réception du 200) crée un doublon silencieux.

### 14.1 Header `Idempotency-Key`

Le client (smartcommon, `useUploadQueue` et `useUpload({queue:true})`) envoie sur chaque requête `POST /upload` :

```
Idempotency-Key: <uuid-v4>
```

La valeur est constante pour toutes les tentatives d'un même blob (rejouée à chaque retry tant que la requête n'a pas abouti en 2xx). Format : UUID v4 (longueur 36, regex `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`).

### 14.2 Comportement attendu côté serveur

À chaque réception de `POST /upload` :

1. Lire le header `Idempotency-Key` (si absent : traiter normalement, sans dédoublonnage, pour compat avec les anciens clients).
2. Chercher dans la table `upload_idempotency` (clé primaire = `(idempotency_key, user_id)`) :
   - **Clé absente** : enregistrer un row `{ idempotency_key, user_id, status:"processing", created_at }`, traiter l'upload, puis mettre à jour le row avec `{ status:"completed", upload_id, response_body, completed_at }` après succès. Retourner la réponse normale (200 + body).
   - **Clé présente, `status="completed"`** : retourner directement `response_body` stocké (même `upload_id`, même HTTP 200). **Ne pas** re-traiter le fichier multipart reçu. Ne pas non plus écrire à nouveau sur le filesystem.
   - **Clé présente, `status="processing"`** : retourner `409 Conflict` avec body `{ error: "upload_in_progress", retry_after_ms: 2000 }`. Le client retentera après le délai.
3. Rétention : purger les rows `upload_idempotency` après 24h (via cron, tâche dolibarr ou TTL). Ce délai couvre largement les retries (backoff max ~60s, maxRetries=10 -> ~10 min).
4. Scope de la clé : `(idempotency_key, user_id)` pour éviter qu'un utilisateur réutilise (accidentellement ou pas) une clé d'un autre. Une même clé envoyée par deux users différents crée deux uploads indépendants.

### 14.3 Codes de réponse côté smartAuth

- `200 OK` : upload accepté, `{ upload_id, filename, mime, size, ... }`.
- `400 Bad Request` : payload invalide (champ manquant, mime non autorisé) -> client marque `failed`/`http_4xx`, pas de retry auto.
- `413 Payload Too Large` : idem, taille > max -> `failed`/`http_4xx`.
- `409 Conflict` : idempotency en cours -> client retry après `retry_after_ms` sans incrémenter `attempts`.
- `5xx` : erreur serveur -> client retry avec backoff (incrémente `attempts`).

### 14.4 Référence d'implémentation

Fichier suggéré côté smartAuth : `api/UploadController.php` (à confirmer selon l'arbo actuelle).

Schéma de la table (MySQL/MariaDB ; à adapter en SQLite pour les tests d'intégration) :

```sql
CREATE TABLE upload_idempotency (
    idempotency_key VARCHAR(64) NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(16) NOT NULL,        -- "processing" | "completed"
    upload_id VARCHAR(64) NULL,
    response_body TEXT NULL,             -- JSON sérialisé de la réponse 200
    created_at INT NOT NULL,
    completed_at INT NULL,
    PRIMARY KEY (idempotency_key, user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Tâche de purge (à câbler sur un cron Dolibarr ou un trigger côté smartAuth) :

```sql
DELETE FROM upload_idempotency WHERE created_at < UNIX_TIMESTAMP() - 86400;
```

Pseudocode middleware (à intégrer dans `UploadController::store()` ou équivalent) :

```php
function handleUpload($request, $user) {
    $key = $request->header('Idempotency-Key');
    if (!$key || !preg_match('/^[0-9a-f-]{36}$/', $key)) {
        // Legacy / pas d'idempotence
        return processUpload($request, $user);
    }
    $existing = db()->selectOne(
        "SELECT status, response_body FROM upload_idempotency
         WHERE idempotency_key = ? AND user_id = ?",
        [$key, $user->id]
    );
    if ($existing) {
        if ($existing['status'] === 'completed') {
            return jsonResponse(200, json_decode($existing['response_body'], true));
        }
        // status === 'processing'
        return jsonResponse(409, ['error' => 'upload_in_progress', 'retry_after_ms' => 2000]);
    }
    db()->insert("INSERT INTO upload_idempotency
        (idempotency_key, user_id, status, created_at)
        VALUES (?, ?, 'processing', ?)",
        [$key, $user->id, time()]);
    try {
        $response = processUpload($request, $user); // peut throw
        db()->update("UPDATE upload_idempotency
            SET status='completed', upload_id=?, response_body=?, completed_at=?
            WHERE idempotency_key=? AND user_id=?",
            [$response['upload_id'], json_encode($response), time(), $key, $user->id]);
        return jsonResponse(200, $response);
    } catch (Exception $e) {
        // En cas d'erreur métier, on supprime la row "processing"
        // pour que le client puisse retenter avec une nouvelle tentative légitime.
        // En cas d'erreur 4xx, on aurait pu laisser la row pour bloquer aussi
        // les retries futurs - choix à confirmer avec l'équipe smartAuth.
        db()->delete("DELETE FROM upload_idempotency
            WHERE idempotency_key=? AND user_id=?", [$key, $user->id]);
        throw $e;
    }
}
```

Point à arbitrer côté smartAuth : que faire d'une row `processing` orpheline (process tué entre l'INSERT et l'UPDATE) ? Suggestion : tâche de purge plus agressive sur `status='processing' AND created_at < now - 600s` (10 min, > maxRetries * backoff cap = 600s côté client).

### 14.5 Tests attendus côté smartAuth

- Sans `Idempotency-Key` : comportement legacy, deux POST identiques créent deux uploads (et deux `upload_id`).
- Avec `Idempotency-Key` : deux POST identiques (même user) renvoient le même `upload_id`, le fichier n'est stocké qu'une fois sur le filesystem.
- `Idempotency-Key` réutilisée par un autre `user_id` : nouvelle entrée, nouvel upload (scoping respecté).
- Concurrence : deux POST simultanés avec la même clé -> le premier traite, le second reçoit 409 (test avec `parallel` ou two-thread).
- Purge 24h : rows `created_at < now - 86400` supprimées.
- Purge `processing` orpheline (si retenue) : rows `status='processing' AND created_at < now - 600` supprimées.
- Validation du format de la clé : header avec valeur non-UUID -> traitement legacy (pas de 400).
