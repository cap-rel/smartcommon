# Mode Offline - SmartCommon

## Vue d'ensemble

SmartCommon fournit des hooks React et utilitaires pour le mode offline, utilisables par SmartAuth et les applications mobiles.

| Export | Description |
|--------|-------------|
| `useOnlineStatus` | Détection online/offline avec health check serveur |
| `useCachedQuery` | Cache de données avec stratégies (network-first, cache-first, SWR) |
| `useAuthenticatedImage` | Cache d'images avec authentification JWT |
| `isIndexedDBAvailable` | Vérifie si IndexedDB est disponible |
| `getStorageEstimate` | Estime l'espace de stockage disponible |
| `requestPersistentStorage` | Demande le stockage persistant |
| `isStoragePersistent` | Vérifie si le stockage est persistant |
| `formatBytes` | Formate une taille en octets |

---

## Installation

Les hooks et utilitaires sont exportés depuis SmartCommon :

```javascript
import {
    // Hooks
    useOnlineStatus,
    ONLINE_STATUS_DEFAULTS,
    useCachedQuery,
    CACHE_STRATEGIES,
    CACHED_QUERY_DEFAULTS,
    useAuthenticatedImage,
    AUTHENTICATED_IMAGE_DEFAULTS,
    generateCacheKey,
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

## Prérequis : Configuration IndexedDB

Les hooks `useCachedQuery` et `useAuthenticatedImage` nécessitent une instance Dexie avec les stores appropriés.

### Schéma recommandé

```javascript
import Dexie from 'dexie';

const db = new Dexie('myApp');

db.version(1).stores({
    // Pour useCachedQuery
    queryCache: 'key',

    // Pour useAuthenticatedImage
    imageCache: 'key'
});

export default db;
```

### Vérification au démarrage

```javascript
import { isIndexedDBAvailable, getStorageEstimate, requestPersistentStorage } from '@cap-rel/smartcommon';

const initOfflineStorage = async () => {
    // Vérifier si IndexedDB est disponible (peut être désactivé en mode privé)
    const available = await isIndexedDBAvailable();
    if (!available) {
        console.warn('IndexedDB non disponible - mode offline désactivé');
        return false;
    }

    // Vérifier l'espace disponible
    const estimate = await getStorageEstimate();
    if (estimate && estimate.available < STORAGE_CONSTANTS.LOW_STORAGE_THRESHOLD) {
        console.warn('Espace de stockage faible:', estimate.availableFormatted);
    }

    // Demander le stockage persistant (évite l'éviction par le navigateur)
    await requestPersistentStorage();

    return true;
};
```

---

## Hook useOnlineStatus

Détecte la connectivité réseau avec un délai de stabilité et un health check serveur optionnel.

### Import

```javascript
import { useOnlineStatus, ONLINE_STATUS_DEFAULTS } from '@cap-rel/smartcommon';
```

### Signature

```javascript
const {
    isOnline,           // boolean - true si le navigateur est en ligne
    isOffline,          // boolean - inverse de isOnline
    isServerReachable,  // boolean | null - true si le serveur répond, null si non testé
    lastOnline,         // number | null - timestamp de la dernière connexion
    lastCheck,          // number | null - timestamp du dernier health check
    checkNow            // () => Promise<{isOnline, isServerReachable}> - force une vérification
} = useOnlineStatus({
    healthCheckUrl: null,        // URL pour vérifier l'accessibilité serveur
    healthCheckInterval: 30000,  // Intervalle entre les vérifications (ms)
    stabilityDelay: 2000,        // Délai avant de déclarer "online" (ms)
    timeout: 5000                // Timeout du health check (ms)
});
```

### Constantes

```javascript
ONLINE_STATUS_DEFAULTS = {
    HEALTH_CHECK_INTERVAL: 30000,  // 30 secondes
    STABILITY_DELAY: 2000,          // 2 secondes
    TIMEOUT: 5000                   // 5 secondes
};
```

### Exemples

```javascript
// Utilisation simple
const { isOnline, isOffline } = useOnlineStatus();

if (isOffline) {
    return <OfflineBanner />;
}
```

```javascript
// Avec health check serveur
const { isOnline, isServerReachable, checkNow } = useOnlineStatus({
    healthCheckUrl: '/api/health',
    healthCheckInterval: 60000
});

// Forcer une vérification
const handleRetry = async () => {
    const { isServerReachable } = await checkNow();
    if (isServerReachable) {
        refetchData();
    }
};
```

### Comportement

1. **Événements navigateur** : Écoute `online` et `offline` sur `window`
2. **Délai de stabilité** : Attend `stabilityDelay` ms avant de déclarer "online" (évite les oscillations WiFi)
3. **Health check** : Si `healthCheckUrl` est fourni, vérifie périodiquement l'accessibilité du serveur
4. **Offline immédiat** : Le passage à "offline" est immédiat (pas de délai)

---

## Hook useCachedQuery

Cache des données avec plusieurs stratégies de cache.

### Import

```javascript
import { useCachedQuery, CACHE_STRATEGIES, CACHED_QUERY_DEFAULTS } from '@cap-rel/smartcommon';
```

### Signature

```javascript
const {
    data,           // any | null - données récupérées ou cachées
    isLoading,      // boolean - true pendant le chargement
    isFromCache,    // boolean - true si les données viennent du cache
    isStale,        // boolean - true si les données sont périmées
    error,          // Error | null - erreur si le fetch a échoué
    lastFetch,      // number | null - timestamp du dernier fetch réussi
    refetch,        // () => Promise<void> - relance le fetch
    invalidate      // () => Promise<void> - supprime le cache et refetch
} = useCachedQuery({
    db,                                    // Instance Dexie
    store,                                 // Nom du store IndexedDB
    key,                                   // Clé de cache unique
    fetchFn,                               // () => Promise<data> - fonction de fetch
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    ttl: 3600000,                          // Time-to-live (ms) - défaut 1h
    staleTime: 60000,                      // Temps avant "stale" (ms) - défaut 1min
    enabled: true                          // Activer/désactiver le fetch
});
```

### Stratégies

```javascript
CACHE_STRATEGIES = {
    NETWORK_FIRST: 'network-first',      // Réseau d'abord, cache en fallback
    CACHE_FIRST: 'cache-first',          // Cache d'abord, réseau si expiré
    STALE_WHILE_REVALIDATE: 'swr'        // Cache immédiat + revalidation background
};
```

### Constantes

```javascript
CACHED_QUERY_DEFAULTS = {
    TTL: 3600000,         // 1 heure
    STALE_TIME: 60000     // 1 minute
};
```

### Comportement par stratégie

| Stratégie | Online | Offline |
|-----------|--------|---------|
| **NETWORK_FIRST** | Fetch réseau, cache en fallback si erreur | Utilise le cache |
| **CACHE_FIRST** | Cache si frais, sinon fetch | Utilise le cache (même stale) |
| **SWR** | Affiche cache immédiatement, revalide en background | Utilise le cache |

### Exemples

```javascript
// Cache de dictionnaires (rarement modifiés)
const { data: countries, isLoading } = useCachedQuery({
    db: db,
    store: 'queryCache',
    key: 'countries',
    fetchFn: () => api.get('dictionaries/countries'),
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    ttl: 86400000  // 24h
});
```

```javascript
// Configuration avec revalidation automatique
const { data: config, isStale } = useCachedQuery({
    db: db,
    store: 'queryCache',
    key: 'app-config',
    fetchFn: () => api.get('config'),
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    staleTime: 300000  // 5 min
});

// Afficher un indicateur si les données sont périmées
{isStale && <RefreshIndicator />}
```

```javascript
// Invalidation manuelle
const handleLogout = async () => {
    await invalidate(); // Supprime le cache et refetch
};
```

---

## Hook useAuthenticatedImage

Cache d'images avec authentification JWT et gestion des blob URLs.

### Import

```javascript
import { useAuthenticatedImage, AUTHENTICATED_IMAGE_DEFAULTS, generateCacheKey } from '@cap-rel/smartcommon';
```

### Signature

```javascript
const {
    src,            // string - URL blob ou placeholder
    isLoading,      // boolean - true pendant le chargement
    isFromCache,    // boolean - true si l'image vient du cache
    error           // Error | null - erreur si le chargement a échoué
} = useAuthenticatedImage({
    db,                           // Instance Dexie
    store: 'imageCache',          // Nom du store (défaut: 'imageCache')
    url,                          // URL de l'image
    token,                        // JWT token pour Authorization header
    ttl: 86400000,                // Time-to-live (ms) - défaut 24h
    staleTime: 3600000,           // Temps avant revalidation background (ms) - défaut 1h
    placeholder: null             // URL image par défaut
});
```

### Constantes

```javascript
AUTHENTICATED_IMAGE_DEFAULTS = {
    TTL: 86400000,        // 24 heures
    STALE_TIME: 3600000   // 1 heure
};
```

### Fonction utilitaire

```javascript
// Génère une clé de cache à partir d'une URL
// Gère les caractères spéciaux et unicode
const cacheKey = generateCacheKey(url);  // ex: 'img_abc123'
```

### Exemple

```javascript
const { src, isLoading, isFromCache, error } = useAuthenticatedImage({
    db: db,
    url: `/api/users/${userId}/photo`,
    token: accessToken,
    placeholder: '/images/default-avatar.png'
});

return (
    <div>
        {isLoading && <Skeleton />}
        <img
            src={src}
            alt="Profile"
            style={{ opacity: isLoading ? 0 : 1 }}
        />
        {isFromCache && <CachedBadge />}
    </div>
);
```

### Comportement

1. **Cache valide** : Affiche immédiatement depuis le cache
2. **Cache stale** : Affiche le cache, revalide en arrière-plan si online
3. **Cache expiré** : Supprime et refetch
4. **Offline sans cache** : Affiche le placeholder
5. **Cleanup** : Les blob URLs sont automatiquement révoquées au unmount

---

## Utilitaires Storage

### Import

```javascript
import {
    isIndexedDBAvailable,
    getStorageEstimate,
    requestPersistentStorage,
    isStoragePersistent,
    formatBytes,
    STORAGE_CONSTANTS
} from '@cap-rel/smartcommon';
```

### Fonctions

#### isIndexedDBAvailable

```javascript
const available = await isIndexedDBAvailable();
// true si IndexedDB est accessible
// false en navigation privée ou si désactivé
```

#### getStorageEstimate

```javascript
const estimate = await getStorageEstimate();
// {
//     usage: 1048576,              // Octets utilisés
//     quota: 10485760,             // Quota total
//     usagePercent: 10,            // Pourcentage utilisé
//     available: 9437184,          // Octets disponibles
//     usageFormatted: '1 MB',      // Formaté
//     quotaFormatted: '10 MB',
//     availableFormatted: '9 MB'
// }
// ou null si l'API n'est pas supportée
```

#### requestPersistentStorage

```javascript
const granted = await requestPersistentStorage();
// true si le stockage persistant a été accordé
// Évite l'éviction des données par le navigateur
```

#### isStoragePersistent

```javascript
const persistent = await isStoragePersistent();
// true si le stockage est actuellement persistant
```

#### formatBytes

```javascript
formatBytes(0);           // '0 B'
formatBytes(1024);        // '1 KB'
formatBytes(1536000);     // '1.46 MB'
formatBytes(1073741824);  // '1 GB'
```

### Constantes

```javascript
STORAGE_CONSTANTS = {
    LOW_STORAGE_THRESHOLD: 52428800,  // 50 MB
    TEST_DB_NAME: '__idb_availability_test__'
};
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SmartCommon                            │
│  (hooks React génériques, briques réutilisables)            │
├─────────────────────────────────────────────────────────────┤
│  useOnlineStatus     │ Détection robuste online/offline     │
│  useCachedQuery      │ Stratégies cache (network-first...)  │
│  useAuthenticatedImage │ Cache images avec JWT              │
│  storage utils       │ Détection IndexedDB, quotas          │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ utilise
┌─────────────────────────────────────────────────────────────┐
│                      SmartAuth                              │
│  (protocole sync Dolibarr, gestion conflits)                │
├─────────────────────────────────────────────────────────────┤
│  useSyncClient       │ Hook React orchestrateur sync        │
│  SyncStorage         │ IndexedDB conforme au schéma spec    │
│  ConflictResolver    │ UI résolution conflits               │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ utilise
┌─────────────────────────────────────────────────────────────┐
│              App Mobile (DoliScubaDiving, etc.)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Arborescence des fichiers

```
src/lib/
├── hooks/
│   └── local/
│       ├── useOnlineStatus/
│       │   ├── index.jsx
│       │   └── index.test.jsx
│       ├── useCachedQuery/
│       │   ├── index.jsx
│       │   └── index.test.jsx
│       └── useAuthenticatedImage/
│           ├── index.jsx
│           └── index.test.jsx
└── utils/
    └── storage/
        ├── index.js
        └── index.test.js
```

---

## Ce que SmartCommon ne fait PAS

Ces fonctionnalités sont du ressort de SmartAuth :

- Queue de changements avec `base_tms` (protocole sync)
- Retry avec backoff pour la synchronisation
- Gestion des statuts sync (pending, syncing, failed, synced)
- Résolution de conflits serveur
- Tombstones et suppressions
- Service Worker pour background sync

---

## Tests

Les tests utilisent `fake-indexeddb` et `vitest` :

```bash
npm run test:run
```

Couverture :
- `useOnlineStatus` : 23 tests
- `useCachedQuery` : 20 tests
- `useAuthenticatedImage` : 22 tests
- `storage utils` : 25 tests

---

## Références

- SmartAuth sync spec : `smartAuth/documentation/spec_sync_offline.md`
- Classe Db SmartCommon : `src/lib/utils/class/Db/index.js`
