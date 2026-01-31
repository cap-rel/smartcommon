# Mode Offline - SmartCommon

## Vue d'ensemble

SmartCommon fournit des hooks React et utilitaires pour le mode offline, utilisables par les applications mobiles Dolibarr.

| Export | Description |
|--------|-------------|
| `useOnlineStatus` | Detection online/offline avec health check serveur |
| `useCachedQuery` | Cache de donnees avec strategies (network-first, cache-first, SWR) |
| `useAuthenticatedImage` | Cache d'images avec authentification JWT |
| `useSyncClient` | Hook de synchronisation offline-first |
| `SyncStorage` | Couche IndexedDB pour la sync |
| `SyncApi` | Client HTTP pour les endpoints sync |
| `SyncEngine` | Orchestration push/pull |
| `ConflictResolver` | UI de resolution des conflits |
| `isIndexedDBAvailable` | Verifie si IndexedDB est disponible |
| `getStorageEstimate` | Estime l'espace de stockage disponible |
| `requestPersistentStorage` | Demande le stockage persistant |
| `isStoragePersistent` | Verifie si le stockage est persistant |
| `formatBytes` | Formate une taille en octets |

---

## Installation

```javascript
import {
    // Hooks offline
    useOnlineStatus,
    useCachedQuery,
    useAuthenticatedImage,

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

Hook principal pour la synchronisation offline-first avec Dolibarr.

### Usage

```javascript
const {
    // Etat connexion
    isOnline,
    isServerReachable,

    // Etat sync
    isInitialized,
    isRegistered,
    isSyncing,
    lastSyncTime,
    pendingCount,
    conflictsCount,
    syncError,

    // Actions
    register,
    sync,
    push,
    pull,

    // Operations locales
    create,
    update,
    remove,

    // Lecture
    getEntity,
    queryEntities,

    // Conflits
    getConflicts,
    resolveConflict,

    // Utilitaires
    getStatus,
    reset
} = useSyncClient({
    apiUrl: '/api/smartauth',
    getAccessToken: () => localStorage.getItem('access_token'),
    scope: ['thirdparty', 'contact', 'product'],
    autoSync: true,
    syncInterval: null,
    onConflict: null,
    onSyncStart: null,
    onSyncComplete: null,
    onSyncError: null,
    dbName: 'smartauth_sync'
});
```

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
        remove,
        getConflicts,
        resolveConflict
    } = useSyncClient({
        apiUrl: '/api/smartauth',
        getAccessToken: () => localStorage.getItem('access_token'),
        scope: ['thirdparty', 'contact']
    });

    // Creer offline
    const handleCreate = async () => {
        const tempId = await create('thirdparty', { name: 'Nouvelle entreprise' });
        console.log('Cree avec ID temporaire:', tempId);
    };

    // Modifier offline
    const handleUpdate = async (id) => {
        await update('thirdparty', id, { name: 'Nom modifie' });
    };

    // Supprimer offline
    const handleDelete = async (id) => {
        await remove('thirdparty', id);
    };

    // Synchroniser
    const handleSync = async () => {
        const result = await sync();
        console.log('Resultat sync:', result);
        // { pushed: {success: 5, conflicts: 1}, pulled: {updated: 10, deleted: 2} }
    };

    return (
        <div>
            <p>Status: {isOnline ? 'En ligne' : 'Hors ligne'}</p>
            <p>Modifications en attente: {pendingCount}</p>
            <button onClick={handleSync} disabled={isSyncing}>
                Synchroniser
            </button>
        </div>
    );
};
```

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

Detecte la connectivite reseau avec un delai de stabilite et un health check serveur optionnel.

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
- Endpoints API : `/sync/register`, `/sync/pull`, `/sync/push`, `/sync/conflicts`
