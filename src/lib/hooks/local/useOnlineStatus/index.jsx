import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Default configuration for useOnlineStatus
 */
export const ONLINE_STATUS_DEFAULTS = {
    HEALTH_CHECK_INTERVAL: 30000,  // 30 seconds
    STABILITY_DELAY: 1000,          // 1 second
    TIMEOUT: 5000                   // 5 seconds
};

/**
 * Hook for robust online/offline detection with optional server health check
 *
 * Detects network connectivity changes and optionally verifies server reachability.
 * Includes a stability delay to prevent rapid oscillations when going online.
 *
 * @param {Object} options - Configuration options
 * @param {string|null} options.healthCheckUrl - URL to check server reachability (null to disable)
 * @param {number} options.healthCheckInterval - Interval between health checks in ms (default: 30000)
 * @param {number} options.stabilityDelay - Delay before declaring online in ms (default: 2000)
 * @param {number} options.timeout - Health check timeout in ms (default: 5000)
 *
 * @returns {Object} Online status information
 * @returns {boolean} returns.isOnline - True if browser reports online
 * @returns {boolean} returns.isOffline - True if browser reports offline
 * @returns {boolean|null} returns.isServerReachable - True if server responded, null if not tested
 * @returns {number|null} returns.lastOnline - Timestamp of last online state
 * @returns {number|null} returns.lastCheck - Timestamp of last health check
 * @returns {() => Promise<boolean>} returns.checkNow - Force an immediate check.
 *   Resolves to whether connectivity is usable: server reachability when a
 *   healthCheckUrl is configured, navigator.onLine otherwise.
 *
 * @example
 * // Simple usage
 * const { isOnline, isOffline } = useOnlineStatus();
 *
 * @example
 * // With server health check
 * const { isOnline, isServerReachable, checkNow } = useOnlineStatus({
 *     healthCheckUrl: '/api/health',
 *     healthCheckInterval: 60000
 * });
 *
 * // In SmartAuth useSyncClient
 * const { isOnline } = useOnlineStatus({
 *     healthCheckUrl: `${apiUrl}/sync/status`
 * });
 */
export const useOnlineStatus = ({
    healthCheckUrl = null,
    healthCheckInterval = ONLINE_STATUS_DEFAULTS.HEALTH_CHECK_INTERVAL,
    stabilityDelay = ONLINE_STATUS_DEFAULTS.STABILITY_DELAY,
    timeout = ONLINE_STATUS_DEFAULTS.TIMEOUT
} = {}) => {
    const getInitialOnline = () => {
        if (typeof navigator === 'undefined') return true;
        return navigator.onLine;
    };

    const [status, setStatus] = useState(() => ({
        isOnline: getInitialOnline(),
        isServerReachable: null,
        lastCheck: null,
        lastOnline: getInitialOnline() ? Date.now() : null
    }));

    const mountedRef = useRef(true);
    const stabilityTimeoutRef = useRef(null);
    const healthCheckIntervalRef = useRef(null);

    // Promise chain rather than async/await: the state writes it feeds are then
    // unambiguously deferred to the response, which is what allows calling it
    // straight from the mount effect below.
    const checkServer = useCallback(() => {
        if (!healthCheckUrl) {
            return Promise.resolve(null);
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return Promise.resolve(false);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        return fetch(healthCheckUrl, {
            method: 'HEAD',
            cache: 'no-store',
            signal: controller.signal
        })
            .then((response) => response.ok)
            .catch(() => false)
            // Cleared on both paths: an aborted or failed request used to leave
            // its timer running.
            .finally(() => clearTimeout(timeoutId));
    }, [healthCheckUrl, timeout]);

    const updateOnlineStatus = useCallback((isOnline) => {
        if (stabilityTimeoutRef.current) {
            clearTimeout(stabilityTimeoutRef.current);
            stabilityTimeoutRef.current = null;
        }

        if (isOnline) {
            stabilityTimeoutRef.current = setTimeout(async () => {
                if (!mountedRef.current) return;

                const serverReachable = await checkServer();

                if (!mountedRef.current) return;

                setStatus(s => ({
                    ...s,
                    isOnline: true,
                    isServerReachable: serverReachable,
                    lastCheck: healthCheckUrl ? Date.now() : s.lastCheck,
                    lastOnline: Date.now()
                }));
            }, stabilityDelay);
        } else {
            setStatus(s => ({
                ...s,
                isOnline: false,
                // Without a healthCheckUrl the server was never probed, so
                // "unreachable" would be a claim we cannot make.
                isServerReachable: healthCheckUrl ? false : null,
                lastCheck: Date.now()
            }));
        }
    }, [checkServer, stabilityDelay, healthCheckUrl]);

    useEffect(() => {
        // Restored on every mount: the cleanup below flips it to false, and a
        // remount (StrictMode's double-mount, a route revisit) would otherwise
        // find it stuck there and silently discard every later update.
        mountedRef.current = true;

        const handleOnline = () => updateOnlineStatus(true);
        const handleOffline = () => updateOnlineStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [updateOnlineStatus]);

    useEffect(() => {
        if (!healthCheckUrl) {
            return undefined;
        }

        const runHealthCheck = () => {
            if (!mountedRef.current) return;

            const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
            if (!isCurrentlyOnline) return;

            checkServer().then((serverReachable) => {
                if (!mountedRef.current) return;

                setStatus(s => ({
                    ...s,
                    isServerReachable: serverReachable,
                    lastCheck: Date.now()
                }));
            });
        };

        // Probe once on mount. Consumers gate work on isServerReachable -
        // useSyncClient blocks its periodic sync on it - so leaving it null
        // until the first tick would stall them for a whole interval (a full
        // minute in the sync client's case).
        runHealthCheck();

        if (!healthCheckInterval || healthCheckInterval <= 0) {
            return undefined;
        }

        healthCheckIntervalRef.current = setInterval(runHealthCheck, healthCheckInterval);

        return () => {
            if (healthCheckIntervalRef.current) {
                clearInterval(healthCheckIntervalRef.current);
                healthCheckIntervalRef.current = null;
            }
        };
    }, [healthCheckUrl, healthCheckInterval, checkServer]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (stabilityTimeoutRef.current) {
                clearTimeout(stabilityTimeoutRef.current);
                stabilityTimeoutRef.current = null;
            }
            if (healthCheckIntervalRef.current) {
                clearInterval(healthCheckIntervalRef.current);
                healthCheckIntervalRef.current = null;
            }
        };
    }, []);

    // Resolves to a BOOLEAN, deliberately: that is the contract every consumer
    // of this hook has ever received, and the richer per-field values are
    // already on the hook's return. Handing back an object instead would make
    // `if (await checkNow())` silently always-true.
    const checkNow = useCallback(async () => {
        const serverReachable = await checkServer();
        const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (mountedRef.current) {
            setStatus(s => ({
                ...s,
                isOnline: isCurrentlyOnline,
                isServerReachable: serverReachable,
                lastCheck: healthCheckUrl ? Date.now() : s.lastCheck,
                lastOnline: isCurrentlyOnline ? Date.now() : s.lastOnline
            }));
        }

        return healthCheckUrl ? serverReachable : isCurrentlyOnline;
    }, [checkServer, healthCheckUrl]);

    return {
        isOnline: status.isOnline,
        isOffline: !status.isOnline,
        isServerReachable: status.isServerReachable,
        lastOnline: status.lastOnline,
        lastCheck: status.lastCheck,
        checkNow
    };
};
