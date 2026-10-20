import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useApi } from 'lib/hooks';
import { createLogger } from 'lib/utils';
import { useOnlineStatus } from '../hooks/local/useOnlineStatus';
import { SyncStorage } from './SyncStorage';
import { SyncApi } from './SyncApi';
import { SyncEngine } from './SyncEngine';

const logger = createLogger('useSyncClient');

/**
 * React hook for offline-first, bidirectional sync against SmartAuth
 * (sync/register, sync/pull, sync/push, sync/conflicts).
 *
 * Requests go through useApi().private: the token, X-DeviceId and token
 * refresh are handled there. The client registers itself on first sync
 * (client_uuid generated and stored locally); the user must have gone
 * through device identification, the server reads the device from the token.
 *
 * @param {Object} options
 * @param {string[]} options.scope - Object types to sync (thirdparty, contact...), parents first
 * @param {string} options.appVersion - App version sent to sync/register
 * @param {string|null} [options.healthCheckUrl] - Server reachability probe for useOnlineStatus
 *   (default: SmartAuth `health` route under useApi's prefixUrl, null for browser online status only)
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
    appVersion = null,
    healthCheckUrl,
    autoSync = true,
    syncInterval = null,
    onConflict = null,
    onSyncStart = null,
    onSyncComplete = null,
    onSyncError = null,
    dbName = 'smartauth_sync'
} = {}) => {
    const { private: http } = useApi();
    const httpRef = useRef(http);

    // apiUrl/getAccessToken belonged to the former contract: requests now use
    // useApi's prefixUrl and token. Said once, they are otherwise ignored.
    const legacyOptionsWarnedRef = useRef(false);
    useEffect(() => {
        if (legacyOptionsWarnedRef.current || (apiUrl === undefined && getAccessToken === undefined)) {
            return;
        }
        legacyOptionsWarnedRef.current = true;
        logger.warning('apiUrl and getAccessToken are ignored: sync requests go through useApi (prefixUrl, token)');
    }, [apiUrl, getAccessToken]);

    // Online status from SmartCommon. Default probe: the public SmartAuth
    // health route (sync/status needs a token and a client_uuid).
    const { isOnline, isServerReachable, checkNow } = useOnlineStatus({
        healthCheckUrl,
        healthCheckInterval: 60000
    });

    // Refs to stabilize callbacks and avoid re-renders
    const scopeRef = useRef(scope);
    const appVersionRef = useRef(appVersion);
    const onConflictRef = useRef(onConflict);
    const onSyncStartRef = useRef(onSyncStart);
    const onSyncCompleteRef = useRef(onSyncComplete);
    const onSyncErrorRef = useRef(onSyncError);

    // Refreshed during the commit (layout phase), never during render: a render
    // React throws away must not publish its callbacks to the sync engine.
    // Layout effects run before any passive effect, so the init effect below
    // and the timers it arms still read the values of the committed render.
    useLayoutEffect(() => {
        httpRef.current = http;
        scopeRef.current = scope;
        appVersionRef.current = appVersion;
        onConflictRef.current = onConflict;
        onSyncStartRef.current = onSyncStart;
        onSyncCompleteRef.current = onSyncComplete;
        onSyncErrorRef.current = onSyncError;
    });

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
                    getHttp: () => httpRef.current
                });

                const engine = new SyncEngine({
                    storage,
                    api,
                    scope: scopeRef.current,
                    appVersion: appVersionRef.current,
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
                logger.error('SyncClient initialization failed:', error);
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
    }, [dbName]);

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

    // Register (or re-register) the client. sync/push/pull register on their
    // own; calling this is only needed to register ahead of the first sync.
    const register = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const result = await engineRef.current.register();
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
            setIsRegistered(status.isRegistered);
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
        setIsRegistered(await engineRef.current.isRegistered());

        if (result.conflicts.length > 0 && onConflictRef.current) {
            onConflictRef.current(result.conflicts);
        }

        return result;
    }, [refreshCounts]);

    // Pull only
    const pull = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        const result = await engineRef.current.pull();

        const status = await engineRef.current.getStatus();
        setIsRegistered(status.isRegistered);
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

    // Upsert entity locally (create if not exists, update if exists)
    // Useful for caching without sync
    const upsert = useCallback(async (table, id, data, queueChange = false) => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        await engineRef.current.upsertLocal(table, id, data, queueChange);
        if (queueChange) {
            await refreshCounts();
        }
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

    // Server-side status of this client (GET sync/status)
    const getServerStatus = useCallback(async () => {
        if (!engineRef.current) {
            throw new Error('SyncClient not initialized');
        }

        return await engineRef.current.getServerStatus();
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

    // Store sync + pendingCount in refs to avoid useEffect dependencies. Both
    // are only read from timers, so the commit-time write is soon enough.
    const syncRef = useRef(sync);
    const pendingCountRef = useRef(pendingCount);
    useLayoutEffect(() => {
        syncRef.current = sync;
        pendingCountRef.current = pendingCount;
    });

    // Auto-sync on return online
    useEffect(() => {
        if (!isInitialized || !autoSync) {
            return;
        }

        // Detect transition from offline to online
        // isServerReachable is null without a healthCheckUrl: only an actual
        // failed probe (false) holds the sync back.
        if (wasOfflineRef.current && isOnline && isServerReachable !== false) {
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
                        logger.error('Auto-sync failed:', error);
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
    useLayoutEffect(() => {
        isOnlineRef.current = isOnline;
        isServerReachableRef.current = isServerReachable;
        isSyncingRef.current = isSyncing;
    });

    // Periodic sync interval
    useEffect(() => {
        if (!isInitialized || !syncInterval || syncInterval <= 0) {
            return;
        }

        syncIntervalRef.current = setInterval(async () => {
            if (isOnlineRef.current && isServerReachableRef.current !== false && !isSyncingRef.current) {
                try {
                    await syncRef.current();
                } catch (error) {
                    logger.error('Periodic sync failed:', error);
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
        upsert,

        // Reading
        getEntity,
        queryEntities,

        // Conflicts
        getConflicts,
        resolveConflict,

        // Utilities
        getStatus,
        getServerStatus,
        reset
    };
};

export default useSyncClient;
