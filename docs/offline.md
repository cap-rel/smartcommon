# Mode Offline - SmartCommon

## Vue d'ensemble

SmartCommon fournit des hooks React et utilitaires pour le mode offline, utilisables par les applications mobiles Dolibarr.

| Export | Description |
|--------|-------------|
| `useOnlineStatus` | Détection online/offline avec health check serveur |
| `useCachedQuery` | Cache de données avec stratégies (network-first, cache-first, SWR) |
| `useAuthenticatedImage` | Cache d'images avec authentification JWT |
| `useUploadQueue` | Queue d'uploads offline-first persistée en IndexedDB |
| `useSyncClient` | Synchronisation bidirectionnelle offline-first (smartauth sync) |
| `useReferenceSync` | Synchronisation en lecture seule d'un référentiel dans la base Dexie du module |
| `SyncStorage` | Couche IndexedDB pour la sync |
| `SyncApi` | Client HTTP des routes sync smartauth, via `useApi().private` |
| `SyncEngine` | Orchestration push/pull |
| `ConflictResolver` | UI de résolution des conflits |
| `isIndexedDBAvailable` | Vérifie si IndexedDB est disponible |
| `getStorageEstimate` | Estime l'espace de stockage disponible |
| `requestPersistentStorage` | Demande le stockage persistant |
| `isStoragePersistent` | Vérifie si le stockage est persistant |
| `formatBytes` | Formate une taille en octets |

---

## Installation

```javascript
import {
    // Hooks offline
    useOnlineStatus,
    useCachedQuery,
    useAuthenticatedImage,
    useUploadQueue,

    // Sync client
    useSyncClient,
    SyncStorage,
    SyncApi,
    SyncEngine,
    ConflictResolver,

    // Utils
    isIndexedDBAvailable,
    getStorageEstimate,
    requestPersistentStorage,
    isStoragePersistent,
    formatBytes,
    STORAGE_CONSTANTS
} from '@cap-rel/smartcommon';
```

---

## Sync Client (useSyncClient)

Synchronisation bidirectionnelle offline-first avec Dolibarr, à travers les
routes sync de smartauth (`sync/register`, `sync/pull`, `sync/push`,
`sync/conflicts`). À utiliser quand l'application **modifie** des données
hors ligne. Pour un référentiel en lecture seule (catalogue, tiers, contacts),
`useReferenceSync` est plus adapté : il écrit directement dans la base Dexie
du module.

### Prérequis

- Le hook passe par `useApi().private` : il doit être monté sous `<Provider>`.
  Le token, l'en-tête `X-DeviceId` et le rafraîchissement du token sont gérés
  par `useApi`, aucun composant n'a à fournir de token.
- L'utilisateur doit avoir associé son appareil (`<DeviceIdentificationComponent>`) :
  `sync/register` lit l'appareil dans le token et répond 400 sinon.
- `scope` liste des types d'objets smartauth (`thirdparty`, `contact`,
  `product`...), parents d'abord : les créations partent dans cet ordre, les
  suppressions dans l'ordre inverse.

### Usage

```javascript
const {
    // État connexion
    isOnline,
    isServerReachable,  // null sans healthCheckUrl

    // État sync
    isInitialized,
    isRegistered,
    isSyncing,
    lastSyncTime,
    pendingCount,
    conflictsCount,
    syncError,

    // Actions
    register,           // facultatif : sync/push/pull s'enregistrent seuls
    sync,
    push,
    pull,

    // Opérations locales
    create,
    update,
    remove,
    upsert,

    // Lecture
    getEntity,
    queryEntities,

    // Conflits
    getConflicts,
    resolveConflict,

    // Utilitaires
    getStatus,          // état local
    getServerStatus,    // GET sync/status
    reset
} = useSyncClient({
    scope: ['thirdparty', 'contact'],
    appVersion: '1.4.0',     // envoyé à sync/register
    healthCheckUrl: null,    // sonde de joignabilité, null = état réseau du navigateur
    autoSync: true,
    syncInterval: null,
    onConflict: null,
    onSyncStart: null,
    onSyncComplete: null,
    onSyncError: null,
    dbName: 'smartauth_sync'
});
```

`apiUrl` et `getAccessToken` ne sont plus utilisés : s'ils sont passés, un
avertissement est journalisé une fois et ils sont ignorés.

### Fonctionnement

- **Enregistrement** : au premier `sync()`, `push()` ou `pull()`, le client
  génère un `client_uuid`, le stocke dans sa base IndexedDB et l'envoie à
  `sync/register` avec `sync_scope` et `app_version`. Si le serveur ne connaît
  plus ce client (404 "Client not registered"), il se réenregistre avec le même
  UUID et rejoue la requête une fois. `client_uuid` (généré côté client) est
  distinct de `device_uuid` (fourni par smartauth et porté par le token).
- **Pull** : un appel par type d'objet, page par page en suivant
  `next_cursor`. Chaque type a son propre point de reprise, avancé seulement
  quand toutes ses pages sont appliquées. Un type en erreur n'arrête pas les
  autres (`result.pulled.errors`). Une entité modifiée localement n'est jamais
  écrasée par le pull.
- **Push** : un appel par type d'objet, 50 changements au plus par appel. Les
  changements en file sur une même entité sont regroupés avant l'envoi (une
  création suivie de modifications part en une seule création). Les
  `temp_id` renvoyés dans `id_mapping` sont remplacés par l'identifiant serveur,
  dans l'entité locale comme dans les clés étrangères des autres changements.
  Un enfant dont le parent n'est pas encore créé reste en file
  (`WAITING_FOR_PARENT`). Un objet absent côté serveur ("Object not found") est
  retiré de la file ; les autres refus restent en file pour le prochain push.
- **403** : la synchronisation s'arrête immédiatement (`ForbiddenSyncError`),
  pour ne pas se faire bloquer par le pare-feu.

### Exemple complet

```javascript
const MyComponent = () => {
    const {
        isOnline,
        isSyncing,
        pendingCount,
        sync,
        create,
        update,
        remove
    } = useSyncClient({
        scope: ['thirdparty', 'contact'],
        appVersion: APP_VERSION
    });

    // Créer hors ligne
    const handleCreate = async () => {
        const tempId = await create('thirdparty', { name: 'Nouvelle entreprise' });
        // Un contact peut référencer le tiers par son ID temporaire
        await create('contact', { lastname: 'Martin', socid: tempId });
    };

    // Modifier hors ligne
    const handleUpdate = async (id) => {
        await update('thirdparty', id, { name: 'Nom modifié' });
    };

    // Supprimer hors ligne
    const handleDelete = async (id) => {
        await remove('thirdparty', id);
    };

    // Synchroniser
    const handleSync = async () => {
        const result = await sync();
        // { pushed: { success, conflicts, errors, id_mappings },
        //   pulled: { updated, deleted, errors }, conflicts, errors }
    };

    return (
        <div>
            <p>Statut : {isOnline ? 'En ligne' : 'Hors ligne'}</p>
            <p>Modifications en attente : {pendingCount}</p>
            <button onClick={handleSync} disabled={isSyncing}>
                Synchroniser
            </button>
        </div>
    );
};
```

### Conflits

- **Modification** : smartauth enregistre le conflit. `getConflicts()` renvoie
  la liste du serveur (identifiant numérique, `client_data`, `server_data`,
  `field_conflicts` sous forme de liste de champs) complétée par le type local.
  `resolveConflict()` passe par `sync/conflicts/{id}/resolve`.
- **Suppression** : smartauth ne l'enregistre pas. Le conflit reste local
  (identifiant `local:<type>:<id>`). `client` remet la suppression en file
  contre la version serveur actuelle, `server` abandonne la suppression et
  récupère à nouveau l'objet au prochain pull. `merged` est refusé.
- Hors ligne, `getConflicts()` renvoie les conflits locaux uniquement.

### ConflictResolver

Composant UI pour la resolution des conflits.

```javascript
const [conflicts, setConflicts] = useState([]);

// Recuperer les conflits
const loadConflicts = async () => {
    setConflicts(await getConflicts());
};

// Resolution
const handleResolve = async (conflictId, resolution, data) => {
    await resolveConflict(conflictId, resolution, data);
    loadConflicts(); // Rafraichir
};

return (
    <ConflictResolver
        conflicts={conflicts}
        onResolve={handleResolve}
        onCancel={() => setConflicts([])}
        labels={{
            title: 'Conflit detecte',
            keepClient: 'Garder ma version',
            keepServer: 'Garder version serveur',
            merge: 'Fusionner'
        }}
    />
);
```

---

## Hook useOnlineStatus

Détecte la connectivité réseau avec un délai de stabilité et un health check serveur optionnel.
`healthCheckUrl` doit répondre sans token à une requête `HEAD` : une route
protégée comme `sync/status` répond toujours 401 ou 403 et le serveur paraît
injoignable.

### Usage

```javascript
const {
    isOnline,           // boolean
    isOffline,          // boolean
    isServerReachable,  // boolean | null
    lastOnline,         // timestamp | null
    lastCheck,          // timestamp | null
    checkNow            // () => Promise
} = useOnlineStatus({
    healthCheckUrl: null,
    healthCheckInterval: 30000,
    stabilityDelay: 2000,
    timeout: 5000
});
```

### Exemple

```javascript
const { isOnline, isOffline } = useOnlineStatus();

if (isOffline) {
    return <OfflineBanner />;
}
```

---

## Hook useCachedQuery

Cache des donnees avec plusieurs strategies.

### Strategies

| Strategie | Online | Offline |
|-----------|--------|---------|
| **NETWORK_FIRST** | Fetch reseau, cache en fallback | Utilise le cache |
| **CACHE_FIRST** | Cache si frais, sinon fetch | Utilise le cache |
| **SWR** | Affiche cache, revalide en background | Utilise le cache |

### Usage

```javascript
const { data, isLoading, isFromCache, error, refetch } = useCachedQuery({
    db,
    store: 'queryCache',
    key: 'countries',
    fetchFn: () => api.get('dictionaries/countries'),
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    ttl: 86400000
});
```

---

## Hook useUploadQueue

Queue d'uploads offline-first. Persiste chaque blob en IndexedDB avant de
rendre la main, puis le pousse vers `/upload` en arriere-plan avec un
backoff exponentiel. Auto-flush a la reconnexion reseau.

```javascript
const { enqueue, pending, retry, cancel, flush, onResolved } = useUploadQueue();

// Offline-safe : enqueue est async et awaite l'ecriture IDB.
const { pending_id } = await enqueue(blob, { interventionId: 42 });

// Branchement pour patcher le form quand le serveur a accepte l'upload :
useEffect(() => onResolved(({ pending_id, upload_id, meta }) => {
    // ... swap pending_id -> upload_id dans le state du form
}), []);
```

Voir [upload-queue.md](upload-queue.md) pour l'integration complete,
le contrat backend smartAuth (header `Idempotency-Key`) et les transitions
d'etat de la queue.

---

## Hook useAuthenticatedImage

Cache d'images avec authentification JWT.

### Usage

```javascript
const { src, isLoading, isFromCache, error } = useAuthenticatedImage({
    db,
    url: `/api/users/${userId}/photo`,
    token: accessToken,
    placeholder: '/images/default-avatar.png'
});

return <img src={src} alt="Profile" />;
```

---

## Utilitaires Storage

```javascript
// Verifier disponibilite IndexedDB
const available = await isIndexedDBAvailable();

// Estimer l'espace disponible
const estimate = await getStorageEstimate();
console.log(estimate.availableFormatted); // "500 MB"

// Demander stockage persistant
await requestPersistentStorage();

// Formater une taille
formatBytes(1536000); // "1.46 MB"
```

---

## Architecture

```
+-------------------------------------------------------------+
|                      SmartCommon                            |
|  (hooks React, composants, utilitaires)                     |
+-------------------------------------------------------------+
|  useOnlineStatus     | Detection robuste online/offline     |
|  useCachedQuery      | Strategies cache (network-first...)  |
|  useAuthenticatedImage | Cache images avec JWT              |
|  useSyncClient       | Hook sync offline-first              |
|  SyncStorage         | IndexedDB pour la sync               |
|  SyncApi             | Client HTTP endpoints sync           |
|  SyncEngine          | Orchestration push/pull              |
|  ConflictResolver    | UI resolution conflits               |
|  storage utils       | Detection IndexedDB, quotas          |
+-------------------------------------------------------------+
                              ^
                              | appelle
+-------------------------------------------------------------+
|                      SmartAuth (PHP)                        |
|  (API serveur Dolibarr)                                     |
+-------------------------------------------------------------+
|  SyncController.php  | Endpoints /sync/*                    |
+-------------------------------------------------------------+
                              ^
                              | utilise
+-------------------------------------------------------------+
|              App Mobile (DoliScubaDiving, etc.)             |
+-------------------------------------------------------------+
```

---

## Arborescence des fichiers

```
src/lib/
+-- hooks/
|   +-- local/
|       +-- useOnlineStatus/
|       +-- useCachedQuery/
|       +-- useAuthenticatedImage/
+-- sync/
|   +-- SyncStorage.js
|   +-- SyncApi.js
|   +-- SyncEngine.js
|   +-- useSyncClient.jsx
|   +-- ConflictResolver.jsx
|   +-- index.js
+-- utils/
    +-- storage/
```

---

## References

- SmartAuth sync spec : `smartAuth/documentation/spec_sync_offline.md`
- Endpoints API : `sync/objects`, `sync/register`, `sync/pull`, `sync/push`, `sync/status`, `sync/conflicts`, `sync/conflicts/{id}/resolve`
