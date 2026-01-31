import { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from '../useOnlineStatus';

/**
 * Cache strategies for useCachedQuery
 */
export const CACHE_STRATEGIES = {
    /** Try network first, fallback to cache on error */
    NETWORK_FIRST: 'network-first',
    /** Use cache if valid, otherwise fetch from network */
    CACHE_FIRST: 'cache-first',
    /** Show cache immediately, revalidate in background if stale */
    STALE_WHILE_REVALIDATE: 'swr'
};

/**
 * Default configuration for useCachedQuery
 */
export const CACHED_QUERY_DEFAULTS = {
    TTL: 3600000,         // 1 hour
    STALE_TIME: 60000     // 1 minute
};

/**
 * Hook for cached data fetching with multiple caching strategies
 *
 * Provides network-first, cache-first, and stale-while-revalidate strategies
 * for managing cached data with automatic online/offline handling.
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.db - Dexie database instance (db.instance from Db class)
 * @param {string} options.store - Name of the IndexedDB store
 * @param {string} options.key - Cache key for this query
 * @param {Function} options.fetchFn - Async function that fetches data
 * @param {string} options.strategy - Cache strategy (default: NETWORK_FIRST)
 * @param {number} options.ttl - Time-to-live in ms (default: 3600000 = 1h)
 * @param {number} options.staleTime - Time before data is considered stale in ms (default: 60000 = 1min)
 * @param {boolean} options.enabled - Enable/disable fetching (default: true)
 *
 * @returns {Object} Query state and controls
 * @returns {any} returns.data - Fetched/cached data
 * @returns {boolean} returns.isLoading - True while fetching
 * @returns {boolean} returns.isFromCache - True if data came from cache
 * @returns {boolean} returns.isStale - True if cached data is stale
 * @returns {Error|null} returns.error - Error if fetch failed
 * @returns {number|null} returns.lastFetch - Timestamp of last successful fetch
 * @returns {Function} returns.refetch - Manually trigger refetch
 * @returns {Function} returns.invalidate - Clear cache and refetch
 *
 * @example
 * // Store schema in your Dexie config:
 * // queryCache: 'key'
 *
 * // Cache-first for dictionaries
 * const { data: countries, isLoading } = useCachedQuery({
 *     db: db.instance,
 *     store: 'queryCache',
 *     key: 'countries',
 *     fetchFn: () => api.get('dictionaries/countries'),
 *     strategy: CACHE_STRATEGIES.CACHE_FIRST,
 *     ttl: 86400000  // 24h
 * });
 *
 * @example
 * // Stale-while-revalidate for config
 * const { data: config, isStale } = useCachedQuery({
 *     db: db.instance,
 *     store: 'queryCache',
 *     key: 'app-config',
 *     fetchFn: () => api.get('config'),
 *     strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
 *     staleTime: 300000  // 5 min
 * });
 */
export const useCachedQuery = ({
    db,
    store,
    key,
    fetchFn,
    strategy = CACHE_STRATEGIES.NETWORK_FIRST,
    ttl = CACHED_QUERY_DEFAULTS.TTL,
    staleTime = CACHED_QUERY_DEFAULTS.STALE_TIME,
    enabled = true
} = {}) => {
    const { isOnline } = useOnlineStatus();
    const mountedRef = useRef(true);
    const executingRef = useRef(false);

    const [state, setState] = useState({
        data: null,
        isLoading: true,
        isFromCache: false,
        isStale: false,
        error: null,
        lastFetch: null
    });

    const getStore = useCallback(() => {
        if (!db || !store) return null;
        return db[store] || null;
    }, [db, store]);

    const getCached = useCallback(async () => {
        const tableStore = getStore();
        if (!tableStore || !key) return null;

        try {
            const record = await tableStore.get(key);
            if (!record) return null;

            const age = Date.now() - record.cachedAt;
            if (age > ttl) {
                await tableStore.delete(key);
                return null;
            }

            return {
                data: record.data,
                isStale: age > staleTime,
                cachedAt: record.cachedAt
            };
        } catch {
            return null;
        }
    }, [getStore, key, ttl, staleTime]);

    const saveToCache = useCallback(async (data) => {
        const tableStore = getStore();
        if (!tableStore || !key) return;

        try {
            await tableStore.put({
                key,
                data,
                cachedAt: Date.now()
            });
        } catch (error) {
            console.warn('useCachedQuery: Failed to cache data:', error);
        }
    }, [getStore, key]);

    const fetchFromNetwork = useCallback(async () => {
        if (!fetchFn) {
            throw new Error('useCachedQuery: fetchFn is required');
        }
        const data = await fetchFn();
        await saveToCache(data);
        return data;
    }, [fetchFn, saveToCache]);

    const execute = useCallback(async () => {
        if (!enabled || executingRef.current) return;
        executingRef.current = true;

        if (!mountedRef.current) {
            executingRef.current = false;
            return;
        }

        setState(s => ({ ...s, isLoading: true, error: null }));

        try {
            const cached = await getCached();

            switch (strategy) {
                case CACHE_STRATEGIES.CACHE_FIRST: {
                    if (cached && !cached.isStale) {
                        if (!mountedRef.current) break;
                        setState({
                            data: cached.data,
                            isLoading: false,
                            isFromCache: true,
                            isStale: false,
                            error: null,
                            lastFetch: cached.cachedAt
                        });
                        break;
                    }

                    if (isOnline) {
                        const data = await fetchFromNetwork();
                        if (!mountedRef.current) break;
                        setState({
                            data,
                            isLoading: false,
                            isFromCache: false,
                            isStale: false,
                            error: null,
                            lastFetch: Date.now()
                        });
                    } else if (cached) {
                        if (!mountedRef.current) break;
                        setState({
                            data: cached.data,
                            isLoading: false,
                            isFromCache: true,
                            isStale: true,
                            error: null,
                            lastFetch: cached.cachedAt
                        });
                    } else {
                        throw new Error('No cached data available and offline');
                    }
                    break;
                }

                case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE: {
                    if (cached) {
                        if (!mountedRef.current) break;
                        setState({
                            data: cached.data,
                            isLoading: false,
                            isFromCache: true,
                            isStale: cached.isStale,
                            error: null,
                            lastFetch: cached.cachedAt
                        });

                        if (cached.isStale && isOnline) {
                            fetchFromNetwork()
                                .then(data => {
                                    if (!mountedRef.current) return;
                                    setState(s => ({
                                        ...s,
                                        data,
                                        isFromCache: false,
                                        isStale: false,
                                        lastFetch: Date.now()
                                    }));
                                })
                                .catch(() => {
                                    // Silently fail background revalidation
                                });
                        }
                        break;
                    }

                    if (isOnline) {
                        const data = await fetchFromNetwork();
                        if (!mountedRef.current) break;
                        setState({
                            data,
                            isLoading: false,
                            isFromCache: false,
                            isStale: false,
                            error: null,
                            lastFetch: Date.now()
                        });
                    } else {
                        throw new Error('No cached data available and offline');
                    }
                    break;
                }

                case CACHE_STRATEGIES.NETWORK_FIRST:
                default: {
                    if (isOnline) {
                        try {
                            const data = await fetchFromNetwork();
                            if (!mountedRef.current) break;
                            setState({
                                data,
                                isLoading: false,
                                isFromCache: false,
                                isStale: false,
                                error: null,
                                lastFetch: Date.now()
                            });
                            break;
                        } catch (networkError) {
                            if (cached) {
                                if (!mountedRef.current) break;
                                setState({
                                    data: cached.data,
                                    isLoading: false,
                                    isFromCache: true,
                                    isStale: true,
                                    error: null,
                                    lastFetch: cached.cachedAt
                                });
                                break;
                            }
                            throw networkError;
                        }
                    } else if (cached) {
                        if (!mountedRef.current) break;
                        setState({
                            data: cached.data,
                            isLoading: false,
                            isFromCache: true,
                            isStale: cached.isStale,
                            error: null,
                            lastFetch: cached.cachedAt
                        });
                    } else {
                        throw new Error('No cached data available and offline');
                    }
                    break;
                }
            }
        } catch (error) {
            if (!mountedRef.current) {
                executingRef.current = false;
                return;
            }
            setState(s => ({
                ...s,
                isLoading: false,
                error
            }));
        } finally {
            executingRef.current = false;
        }
    }, [enabled, strategy, isOnline, getCached, fetchFromNetwork]);

    useEffect(() => {
        mountedRef.current = true;
        execute();

        return () => {
            mountedRef.current = false;
        };
    }, [execute]);

    const invalidate = useCallback(async () => {
        const tableStore = getStore();
        if (tableStore && key) {
            try {
                await tableStore.delete(key);
            } catch {
                // Ignore delete errors
            }
        }
        executingRef.current = false;
        await execute();
    }, [getStore, key, execute]);

    const refetch = useCallback(async () => {
        executingRef.current = false;
        await execute();
    }, [execute]);

    return {
        data: state.data,
        isLoading: state.isLoading,
        isFromCache: state.isFromCache,
        isStale: state.isStale,
        error: state.error,
        lastFetch: state.lastFetch,
        refetch,
        invalidate
    };
};
