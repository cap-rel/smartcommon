import { useState, useEffect, useMemo, useRef } from 'react';
import { useOnlineStatus } from '../useOnlineStatus';

/**
 * Default configuration for useAuthenticatedImage
 */
export const AUTHENTICATED_IMAGE_DEFAULTS = {
    TTL: 86400000,        // 24 hours
    STALE_TIME: 3600000   // 1 hour
};

/**
 * Generates a simple hash key from a URL
 * Uses encodeURIComponent to handle special characters safely
 * @param {string} url - URL to hash
 * @returns {string} Hash key
 */
export const generateCacheKey = (url) => {
    if (!url) return null;

    const encoded = encodeURIComponent(url);
    let hash = 0;
    for (let i = 0; i < encoded.length; i++) {
        const char = encoded.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return 'img_' + Math.abs(hash).toString(36);
};

/**
 * Hook for loading authenticated images with IndexedDB caching
 *
 * Fetches images with JWT authentication headers and caches them as blobs
 * in IndexedDB. Supports TTL, stale-while-revalidate pattern, and offline fallback.
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.db - Dexie database instance (db.instance from Db class)
 * @param {string} options.store - Name of the IndexedDB store (default: 'imageCache')
 * @param {string} options.url - URL of the image to load
 * @param {string} options.token - JWT token for Authorization header
 * @param {number} options.ttl - Time-to-live in ms (default: 86400000 = 24h)
 * @param {number} options.staleTime - Time before stale in ms (default: 3600000 = 1h)
 * @param {string|null} options.placeholder - Placeholder image URL
 *
 * @returns {Object} Image loading state
 * @returns {string} returns.src - Image source (blob URL or placeholder)
 * @returns {boolean} returns.isLoading - True while loading
 * @returns {boolean} returns.isFromCache - True if image came from cache
 * @returns {Error|null} returns.error - Error if loading failed
 *
 * @example
 * // Store schema in your Dexie config:
 * // imageCache: 'key'
 *
 * const { src, isLoading, isFromCache, error } = useAuthenticatedImage({
 *     db: db.instance,
 *     url: `/api/users/${userId}/photo`,
 *     token: accessToken,
 *     placeholder: '/images/default-avatar.png'
 * });
 *
 * return <img src={src} alt="Profile" />;
 */
export const useAuthenticatedImage = ({
    db,
    store = 'imageCache',
    url,
    token,
    ttl = AUTHENTICATED_IMAGE_DEFAULTS.TTL,
    staleTime = AUTHENTICATED_IMAGE_DEFAULTS.STALE_TIME,
    placeholder = null
} = {}) => {
    const { isOnline } = useOnlineStatus();
    const mountedRef = useRef(true);
    const objectUrlRef = useRef(null);

    const [state, setState] = useState({
        src: placeholder,
        isLoading: Boolean(url),
        isFromCache: false,
        error: null
    });

    const cacheKey = useMemo(() => generateCacheKey(url), [url]);

    const getStore = () => {
        if (!db || !store) return null;
        return db[store] || null;
    };

    const revokeCurrentUrl = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    };

    useEffect(() => {
        mountedRef.current = true;

        if (!url || !cacheKey) {
            setState({
                src: placeholder,
                isLoading: false,
                isFromCache: false,
                error: null
            });
            return;
        }

        let localObjectUrl = null;

        const loadImage = async () => {
            if (!mountedRef.current) return;

            setState(s => ({ ...s, isLoading: true, error: null }));

            const tableStore = getStore();

            try {
                // Check cache first
                if (tableStore) {
                    const cached = await tableStore.get(cacheKey);

                    if (cached && cached.blob) {
                        const age = Date.now() - cached.cachedAt;

                        if (age < ttl) {
                            revokeCurrentUrl();
                            localObjectUrl = URL.createObjectURL(cached.blob);
                            objectUrlRef.current = localObjectUrl;

                            if (!mountedRef.current) {
                                URL.revokeObjectURL(localObjectUrl);
                                return;
                            }

                            setState({
                                src: localObjectUrl,
                                isLoading: false,
                                isFromCache: true,
                                error: null
                            });

                            // Background refresh if stale
                            if (age > staleTime && isOnline) {
                                fetchAndCache().catch(() => {
                                    // Silently fail background refresh
                                });
                            }

                            return;
                        }

                        // Expired, delete
                        await tableStore.delete(cacheKey);
                    }
                }

                // No valid cache
                if (isOnline) {
                    await fetchAndCache();
                } else {
                    if (!mountedRef.current) return;
                    setState({
                        src: placeholder,
                        isLoading: false,
                        isFromCache: false,
                        error: new Error('Offline and no cached image')
                    });
                }
            } catch (error) {
                if (!mountedRef.current) return;
                setState({
                    src: placeholder,
                    isLoading: false,
                    isFromCache: false,
                    error
                });
            }
        };

        const fetchAndCache = async () => {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const tableStore = getStore();

            // Save to cache
            if (tableStore) {
                try {
                    await tableStore.put({
                        key: cacheKey,
                        blob,
                        url,
                        cachedAt: Date.now()
                    });
                } catch (cacheError) {
                    console.warn('useAuthenticatedImage: Failed to cache image:', cacheError);
                }
            }

            if (!mountedRef.current) return;

            revokeCurrentUrl();
            localObjectUrl = URL.createObjectURL(blob);
            objectUrlRef.current = localObjectUrl;

            setState({
                src: localObjectUrl,
                isLoading: false,
                isFromCache: false,
                error: null
            });
        };

        loadImage();

        return () => {
            mountedRef.current = false;
            if (localObjectUrl) {
                URL.revokeObjectURL(localObjectUrl);
            }
        };
    }, [url, cacheKey, token, ttl, staleTime, isOnline, placeholder, db, store]);

    // Final cleanup on unmount
    useEffect(() => {
        return () => {
            revokeCurrentUrl();
        };
    }, []);

    return {
        src: state.src,
        isLoading: state.isLoading,
        isFromCache: state.isFromCache,
        error: state.error
    };
};
