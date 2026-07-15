# TODO smartcommon - hook `useReferenceSync` (sync catalogue offline factorisée)

## Contexte

Plusieurs PWA (offlinepropale, bientôt SmartPOS) ont besoin de synchroniser un
**référentiel offline** (produits, catégories, tiers, contacts + leurs images/PDF)
depuis un backend Dolibarr via SmartAuth. offlinepropale a déjà écrit toute cette
logique à la main dans `mobile/src/hooks/useSyncService.jsx` (~1840 lignes). SmartPOS
s'apprête à réécrire la même chose.

Objectif : **factoriser le noyau générique dans smartcommon** sous forme d'un hook
config-driven `useReferenceSync`, consommé par les deux modules. Chaque module ne
fournit plus que sa configuration (liste d'entités, de documents, mappers de champs).
Le push métier (propositions, upload terrain, etc.) reste dans chaque module : le hook
est **pull-only** (référentiel en lecture).

Ce document est le pendant de `~/dev/smartauth/todo.md` (améliorations backend
`pull_where` + pagination du `SyncController`). Les deux vont ensemble.

---

## Emplacement et export

- Fichier : `src/lib/sync/useReferenceSync.jsx` (à côté de `useSyncClient.jsx`).
- Exporter via `src/lib/sync/index.js` puis `src/lib/index.js` (respecter le dual
  export system, cf `~/docs/SMARTMAKER_STACK.md` section "Dual Export System").
- **RAPPEL file:/dist** : smartcommon est linké en `file:` chez les consumers, qui
  chargent `dist/`, pas `src/`. Après chaque modif il faut `npm run build` dans
  smartcommon, sinon SmartPOS/offlinepropale ne voient pas le nouveau code.

---

## Différence avec `useSyncClient` existant

`useSyncClient` (déjà présent dans `src/lib/sync/`) est un client bas niveau : il
stocke les entités dans sa propre base Dexie (`smartauth_sync`, store `entities` à clé
`[table+id]`) et se lit par `queryEntities` (scan). Il gère aussi le push, les
conflits, l'idempotency.

`useReferenceSync` est une **orchestration haut niveau, pull-only**, qui écrit dans les
**stores Dexie propres du module** (indexés : `products` avec index `barcode`,
`categories`, etc.). C'est ce que fait déjà offlinepropale à la main. Les deux hooks
coexistent : `useSyncClient` pour le push transactionnel (ventes SmartPOS), 
`useReferenceSync` pour le référentiel offline.

---

## API proposée (config-driven)

```jsx
const {
  isSyncing,        // bool
  syncProgress,     // { step, current, total } | null
  lastSyncAt,       // ISO string | null
  error,            // Error | null
  syncNow,          // async () => void  (orchestration complète)
  resetSync,        // async () => void  (clear stores + full resync)
} = useReferenceSync({
  db,               // instance Dexie du module (stores propres au module)
  appVersion,       // string, envoyé au register
  entities: [
    // objectType = clé sync backend ; store = table Dexie cible du module
    { objectType: 'product',  store: 'products',   mapper: mapProduct,  cleanOrphans: false },
    { objectType: 'category', store: 'categories', mapper: mapCategory, cleanOrphans: true  },
  ],
  documents: [
    // sync des fichiers en bundle ZIP -> store Dexie de blobs
    { objectType: 'product',  store: 'productDocuments',  fk: 'product_id',  doctypes: ['image'] },
    { objectType: 'category', store: 'categoryDocuments', fk: 'category_id', doctypes: ['image'] },
  ],
  dataFeeds: [
    // GET simple -> remplissage d'un store (dictionnaires, config...) - optionnel
    // { key: 'paymentModes', endpoint: 'syncdata/payment-modes', store: 'paymentModes', mapper? },
  ],
  metaStore: 'syncMeta',   // store clé/valeur pour clientUuid + lastSyncAt par type
  getSyncPreferences,      // optionnel: () => Promise<{ syncImages, syncPdfs, ... }>
  onProgress,              // optionnel: (progress) => void
});
```

Le hook utilise `useApi` en interne (contexte Provider). `db` est passé en paramètre
car chaque module a sa propre base Dexie avec ses propres stores indexés.

---

## Noyau générique à implémenter

Source de référence à extraire (ne PAS deviner, recopier le comportement) :
`offlinepropale/mobile/src/hooks/useSyncService.jsx` et les fichiers de sync documents.

| Fonction | Origine offlinepropale (fichier:ligne) | Rôle |
|---|---|---|
| `registerSyncClient()` | useSyncService.jsx:180-208 | POST `sync/register`, gère/persiste `clientUuid` dans metaStore, envoie `sync_scope` (= objectTypes des entities). |
| `getLastSyncTimestamp` / `saveLastSyncTimestamp` | useSyncService.jsx:128-149 | Lecture/écriture `lastSyncAt` dans metaStore. **Amélioration : une clé par objectType** (`lastSyncAt_<type>`), pour des deltas indépendants. |
| `pullEntity(objectType, store, uuid, signal, mapper?, cleanOrphans?)` | useSyncService.jsx:285-378 | Pull delta d'une entité -> `db[store].put()`. Applique `mapper`, traite `updated` + `deleted` (tombstones), option `cleanOrphans` (petits datasets). **À adapter pour la pagination, voir plus bas.** |
| `syncDocumentType(objectType, store, fk, doctypes, options)` | syncProductDocuments.js:90-321 + syncCategoryDocuments.js:210-389 | Généralise les deux fonctions doc en UNE : métadonnées via `object/documents/{objectType}/{doctypes}[/since/{ts}]` -> compare local (`updated_at`) -> `downloadBundle(api, shares, {signal})` (déjà dans smartcommon) -> `db[store].put({ blob, [fk]: objectId, server_id, ... })` -> purge orphelins. Le `fk` (`product_id` / `category_id`) et l'endpoint sont paramétrés. |
| `syncDataFeed(feed)` | useSyncService.jsx:488-560 (pattern) | GET simple d'un endpoint -> remplit un store (dictionnaires/config). Pattern générique paramétré par `{ endpoint, store, mapper? }`. |
| `createTimeoutSignal(existingSignal, timeoutMs)` | useSyncService.jsx:63-93 | Combine AbortSignal externe + timeout interne. |
| `ForbiddenSyncError` + détection 403 | useSyncService.jsx:34-50 | Arrêt immédiat de la sync sur 403 (protection firewall/blacklist). |
| État/progress | useSyncService.jsx:106-109, 1826-1839 | `isSyncing`, `syncProgress`, `lastSyncAt`, `error` exposés. |
| `syncNow()` (orchestrateur) | useSyncService.jsx:865-979 (`pullReferenceData`) | register -> boucle `pullEntity` sur `entities` -> boucle `syncDocumentType` sur `documents` -> boucle `syncDataFeed` sur `dataFeeds` -> save timestamps. |
| `resetSync()` | useSyncService.jsx:1775-1812 | Clear des stores configurés (entities + documents + dataFeeds + metaStore) puis full resync. Générique car piloté par la config, plus de liste hardcodée. |

Taille estimée du noyau : ~500 lignes.

---

## Ce qui reste dans chaque module (HORS scope du hook)

- La **config** (`entities`, `documents`, `dataFeeds`) et les **mappers de champs**
  (`mapProductFields`, `mapCategoryFields`...) : cf useSyncService.jsx:248-274.
- Tout le **PUSH métier** : `pushPrepropsals`, `pushPendingThirdparties`,
  `detectOrphanPrepropsals`, upload documents/images terrain
  (useSyncService.jsx:1358-1770). SmartPOS n'en a pas pour le catalogue ; ses ventes
  passent déjà par `useSyncClient`.
- Les data feeds spécifiques (templates, écotaxe, stock, company-info) : ce sont des
  `dataFeeds` déclarés dans la config du module, pas du code dans le hook.

---

## Adaptation au nouveau contrat backend smartauth

Le `SyncController` de smartauth va gagner pagination + `pull_where` (cf
`~/dev/smartauth/todo.md`). Conséquences côté hook :

1. **Pagination** : `pullEntity` ne fait plus un seul GET. Le backend expose DEUX
   modes ; utiliser le **curseur** (`cursor` / `next_cursor`), recommandé car robuste
   aux lignes insérées pendant la passe (pas de doublon ni de saut) ; l'offset reste
   un repli. Contrat de réponse : `{ updated[], deleted[], has_more, next_cursor?,
   server_time }`, ordre `tms ASC, rowid ASC`. Le `deleted[]` (tombstones +
   exclusions `pull_where`) n'est renvoyé que sur la **première page** (pas de cursor,
   offset 0).
   ```js
   let cursor = null;
   let serverTime = null;
   for (;;) {
     const res = await api.get('sync/pull', {
       searchParams: {
         client_uuid: uuid, object_type: objectType, last_sync_at,
         limit: 1000, ...(cursor ? { cursor } : {}),   // no cursor => first page
       },
       signal,
     }).json();
     // apply res.updated -> db[store].put(...)
     if (!cursor) { /* first page only: apply res.deleted (tombstones + exclusions) */ }
     serverTime = res.server_time;
     if (!res.has_more) break;
     cursor = res.next_cursor;
   }
   // save server_time (per objectType) ONLY after the last page succeeded (no gap on crash)
   ```
   `limit` est borné 1..1000 côté serveur. `last_sync_at` doit rester FIXE pendant
   toute la passe.
2. **Filtre serveur `pull_where`** : le filtrage métier (`tosell=1`, `type=0`) est fait
   côté serveur. Le client n'a plus à filtrer avant stockage. Les produits qui sortent
   du filtre (ex. `tosell` passe à 0) arrivent dans `deleted` (exclusions) et sont
   purgés automatiquement -> `cleanOrphans` devient inutile pour ces entités.
3. **`object_type` unique** : le endpoint `pull` prend un `object_type` par appel
   (pas de multi-tables). Le hook boucle sur `entities` séquentiellement. C'est déjà
   le format d'offlinepropale.

---

## Stratégie de migration (IMPORTANT : ne pas casser offlinepropale)

offlinepropale **fonctionne déjà**. Ordre recommandé :

1. Implémenter `useReferenceSync` dans smartcommon + tests unitaires + build.
2. **Brancher SmartPOS d'abord** (nouveau consumer, rien à casser) : valide
   l'abstraction en conditions réelles.
3. **Migrer offlinepropale ensuite, à froid**, avec non-régression stricte : le hook
   doit reproduire exactement le comportement de l'actuel `useSyncService.jsx` pour la
   partie pull. Le push métier d'offlinepropale reste inchangé et continue d'appeler
   ses propres fonctions.

"Factoriser d'emblée" = le code naît dans smartcommon dès le départ ; cela n'oblige
pas à migrer offlinepropale le jour 1.

---

## Tests

- Tests unitaires du hook dans `src/lib/sync/useReferenceSync.test.jsx` (suivre le
  style des tests existants `useSyncClient.test.jsx`, `SyncEngine.test.js`) :
  - `pullEntity` applique le mapper, écrit dans le bon store, traite updated/deleted.
  - Pagination : boucle jusqu'à `has_more === false`, agrège sans doublon ni trou,
    `deleted` seulement sur la première page.
  - `syncDocumentType` : télécharge en bundle, stocke les blobs, purge les orphelins.
  - Arrêt sur 403 (`ForbiddenSyncError`).
  - `syncNow` orchestre entities -> documents -> dataFeeds dans l'ordre.
- Non-régression offlinepropale au moment de la migration (phase 3).

---

## Résumé des livrables

| Livrable | Emplacement | Nature |
|---|---|---|
| Hook `useReferenceSync` | `src/lib/sync/useReferenceSync.jsx` | nouveau |
| Export | `src/lib/sync/index.js` + `src/lib/index.js` | modif |
| Tests | `src/lib/sync/useReferenceSync.test.jsx` | nouveau |
| Build dist | `npm run build` | obligatoire avant conso |

Dépend de : `~/dev/smartauth/todo.md` (pagination + `pull_where`) pour la partie
backend. Le hook peut être écrit en parallèle ; la pagination `has_more` ne devient
pleinement utile qu'une fois le backend livré (rétrocompatible d'ici là).
