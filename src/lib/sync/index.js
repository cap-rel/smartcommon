/**
 * SmartCommon Sync Client
 *
 * Offline-first synchronization for Dolibarr PWA applications.
 *
 * Usage:
 *
 * import { useSyncClient, ConflictResolver } from '@cap-rel/smartcommon';
 *
 * const MyComponent = () => {
 *     const {
 *         isOnline,
 *         isSyncing,
 *         pendingCount,
 *         sync,
 *         create,
 *         update,
 *         remove,
 *         getConflicts,
 *         resolveConflict
 *     } = useSyncClient({
 *         apiUrl: '/api/smartauth',
 *         getAccessToken: () => localStorage.getItem('access_token'),
 *         scope: ['thirdparty', 'contact', 'product']
 *     });
 *
 *     // Create offline
 *     const handleCreate = async () => {
 *         const tempId = await create('thirdparty', { name: 'New Company' });
 *         console.log('Created with temp ID:', tempId);
 *     };
 *
 *     // Sync when online
 *     const handleSync = async () => {
 *         const result = await sync();
 *         console.log('Synced:', result);
 *     };
 *
 *     return (
 *         <div>
 *             <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
 *             <p>Pending changes: {pendingCount}</p>
 *             <button onClick={handleSync} disabled={isSyncing}>
 *                 Sync
 *             </button>
 *         </div>
 *     );
 * };
 */

// Core classes
export { SyncStorage } from './SyncStorage';
export { SyncApi } from './SyncApi';
export { SyncEngine } from './SyncEngine';

// React hooks
export { useSyncClient } from './useSyncClient';
export { useReferenceSync, ForbiddenSyncError } from './useReferenceSync';

// UI components
export { ConflictResolver } from './ConflictResolver';

// Default export
export { useSyncClient as default } from './useSyncClient';
