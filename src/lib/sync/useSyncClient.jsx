import { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from '../hooks/local/useOnlineStatus';
import { SyncStorage } from './SyncStorage';
import { SyncApi } from './SyncApi';
import { SyncEngine } from './SyncEngine';

/**
 * React hook for offline sync functionality
 *
 * @param {Object} options
 * @param {string} options.apiUrl - Base URL for sync API
 * @param {Function} options.getAccessToken - Function returning JWT access token
 * @param {string[]} options.scope - Tables to sync
 * @param {boolean} options.autoSync - Auto-sync when returning online (default: true)
 * @param {number|null} options.syncInterval - Periodic sync interval in ms (default: null)
 * @param {Function} options.onConflict - Callback when conflicts are detected
 * @param {Function} options.onSyncStart - Callback when sync starts
 * @param {Function} options.onSyncComplete - Callback when sync completes
 * @param {Function} options.onSyncError - Callback when sync fails
 * @param {string} options.dbName - IndexedDB database name (default: 'smartauth_sync')
 */
export const useSyncClient = ({
    apiUrl,
    getAccessToken,
    scope,
    autoSync = true,
    syncInterval = null,
    onConflict = null,
    onSyncStart = null,
    onSyncComplete = null,
    onSyncError = null,
    dbName = 'smartauth_sync'
} = {}) => {
    // Online status from SmartCommon
    const { isOnline, isServerReachable, checkNow } = useOnlineStatus({
        healthCheckUrl: apiUrl ? `${apiUrl}/sync/status` : null,
        healthCheckInterval: 60000
    });

    // Refs to stabilize callbacks and avoid re-renders
    const getAccessTokenRef = useRef(getAccessToken);
    const scopeRef = useRef(scope);
    const onConflictRef = useRef(onConflict);
    const onSyncStartRef = useRef(onSyncStart);
    const onSyncCompleteRef = useRef(onSyncComplete);
    const onSyncErrorRef = useRef(onSyncError);

    getAccessTokenRef.current = getAccessToken;
    scopeRef.current = scope;
    onConflictRef.current = onConflict;
    onSyncStartRef.current = onSyncStart;
    onSyncCompleteRef.current = onSyncComplete;
    onSyncErrorRef.current = onSyncError;

    // State
    const [isRegistered, setIsRegistered] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [conflictsCount, setConflictsCount] = useState(0);
    const [syncError, setSyncError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Refs for engine and instances
    const storageRef = useRef(null);
    const apiRef = useRef(null);
    const engineRef = useRef(null);
    const syncIntervalRef = useRef(null);
    const wasOfflineRef = useRef(!isOnline);
    const autoSyncTimeoutRef = useRef(null);

    // Initialize storage and engine
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                // Create instances
                const storage = new SyncStorage(dbName);
                await storage.init();

                const api = new SyncApi({
                    baseUrl: apiUrl,
                    getAccessToken: () => getAccessTokenRef.current?.()
                });

                const engine = new SyncEngine({
                    storage,
                    api,
                    scope: scopeRef.current,
                    pushChunkSize: 50
                });

                // Store refs
                storageRef.current = storage;
                apiRef.current = api;
                engineRef.current = engine;

                // Load initial state
                if (mounted) {
                    const status = await engine.getStatus();
                    setIsRegistered(status.isRegistered);
                    setLastSyncTime(status.lastSyncTime);
                    setPendingCount(status.pendingCount);
                    setConflictsCount(status.conflictsCount);

                    // Set client UUID on API if registered
                    if (status.clientUuid) {
                        api.setClientUuid(status.clientUuid);
                    }

                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('SyncClient initialization failed:', error);
                if (mounted) {
                    setSyncError(error);
                }
            }
        };

        init();

        return () => {
            mounted = false;
            if (storageRef.current) {
                storageRef.current.close();
            }
        };
    }, [apiUrl, dbName]);

    // Refresh counts
    const refreshCounts = useCallback(async () => {
        if (!storageRef.current) return;

        const [pending, conflicts] = await Promise.all([
            storageRef.current.getPendingChangesCount(),
            storageRef.current.getConflictsCount()
        ]);

        setPendingCount(pending);
        setConflictsCount(conflicts);
    }, []);

    // Register client
    const register = useCallback(async (deviceUuid) => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const result = await engineRef.current.register(deviceUuid);
        setIsRegistered(true);

        return result;
    }, []);

    // Full sync
    const sync = useCallback(async () => {
        if (!engineRef.current || isSyncing) {
            return null;
        }

        setIsSyncing(true);
        setSyncError(null);

        if (onSyncStartRef.current) {
            onSyncStartRef.current();
        }

        try {
            const result = await engineRef.current.sync();

            // Update state
            const status = await engineRef.current.getStatus();
            setLastSyncTime(status.lastSyncTime);
            setPendingCount(status.pendingCount);
            setConflictsCount(status.conflictsCount);

            // Notify about conflicts
            if (result.conflicts.length > 0 && onConflictRef.current) {
                onConflictRef.current(result.conflicts);
            }

            if (onSyncCompleteRef.current) {
                onSyncCompleteRef.current(result);
            }

            return result;
        } catch (error) {
            setSyncError(error);
            if (onSyncErrorRef.current) {
                onSyncErrorRef.current(error);
            }
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing]);

    // Push only
    const push = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const result = await engineRef.current.push();
        await refreshCounts();

        return result;
    }, [refreshCounts]);

    // Pull only
    const pull = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const result = await engineRef.current.pull();

        const status = await engineRef.current.getStatus();
        setLastSyncTime(status.lastSyncTime);

        return result;
    }, []);

    // Create entity locally
    const create = useCallback(async (table, data) => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const tempId = await engineRef.current.createLocal(table, data);
        await refreshCounts();

        return tempId;
    }, [refreshCounts]);

    // Update entity locally
    const update = useCallback(async (table, id, data) => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        await engineRef.current.updateLocal(table, id, data);
        await refreshCounts();
    }, [refreshCounts]);

    // Delete entity locally
    const remove = useCallback(async (table, id) => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        await engineRef.current.deleteLocal(table, id);
        await refreshCounts();
    }, [refreshCounts]);

    // Get single entity
    const getEntity = useCallback(async (table, id) => {
        if (!storageRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const entity = await storageRef.current.getEntity(table, id);
        return entity ? entity.data : null;
    }, []);

    // Query entities
    const queryEntities = useCallback(async (table, filter = null) => {
        if (!storageRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const entities = await storageRef.current.getEntitiesByTable(table);
        let results = entities.map(e => e.data);

        if (filter && typeof filter === 'function') {
            results = results.filter(filter);
        }

        return results;
    }, []);

    // Get conflicts
    const getConflicts = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        return await engineRef.current.getConflicts();
    }, []);

    // Resolve conflict
    const resolveConflict = useCallback(async (conflictId, resolution, data = null) => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const result = await engineRef.current.resolveConflict(conflictId, resolution, data);
        await refreshCounts();

        return result;
    }, [refreshCounts]);

    // Get sync status
    const getStatus = useCallback(async () => {
        if (!engineRef.current) {
            return null;
        }

        return await engineRef.current.getStatus();
    }, []);

    // Reset all sync data
    const reset = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        await engineRef.current.reset();
        setIsRegistered(false);
        setLastSyncTime(null);
        setPendingCount(0);
        setConflictsCount(0);
        setSyncError(null);
    }, []);

    // Store sync in ref to avoid useEffect dependency
    const syncRef = useRef(sync);
    syncRef.current = sync;

    // Store pendingCount in ref for auto-sync check
    const pendingCountRef = useRef(pendingCount);
    pendingCountRef.current = pendingCount;

    // Auto-sync on return online
    useEffect(() => {
        if (!isInitialized || !autoSync) {
            return;
        }

        // Detect transition from offline to online
        if (wasOfflineRef.current && isOnline && isServerReachable) {
            // Wait 2 seconds for stability before syncing
            if (autoSyncTimeoutRef.current) {
                clearTimeout(autoSyncTimeoutRef.current);
            }

            autoSyncTimeoutRef.current = setTimeout(async () => {
                // Only sync if there are pending changes
                if (pendingCountRef.current > 0) {
                    try {
                        await syncRef.current();
                    } catch (error) {
                        console.error('Auto-sync failed:', error);
                    }
                }
            }, 2000);
        }

        wasOfflineRef.current = !isOnline;

        return () => {
            if (autoSyncTimeoutRef.current) {
                clearTimeout(autoSyncTimeoutRef.current);
            }
        };
    }, [isOnline, isServerReachable, isInitialized, autoSync]);

    // Store isOnline/isServerReachable/isSyncing in refs for interval check
    const isOnlineRef = useRef(isOnline);
    const isServerReachableRef = useRef(isServerReachable);
    const isSyncingRef = useRef(isSyncing);
    isOnlineRef.current = isOnline;
    isServerReachableRef.current = isServerReachable;
    isSyncingRef.current = isSyncing;

    // Periodic sync interval
    useEffect(() => {
        if (!isInitialized || !syncInterval || syncInterval <= 0) {
            return;
        }

        syncIntervalRef.current = setInterval(async () => {
            if (isOnlineRef.current && isServerReachableRef.current && !isSyncingRef.current) {
                try {
                    await syncRef.current();
                } catch (error) {
                    console.error('Periodic sync failed:', error);
                }
            }
        }, syncInterval);

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [isInitialized, syncInterval]);

    return {
        // Connection state
        isOnline,
        isServerReachable,
        checkNow,

        // Sync state
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

        // Local operations
        create,
        update,
        remove,

        // Reading
        getEntity,
        queryEntities,

        // Conflicts
        getConflicts,
        resolveConflict,

        // Utilities
        getStatus,
        reset
    };
};

export default useSyncClient;
