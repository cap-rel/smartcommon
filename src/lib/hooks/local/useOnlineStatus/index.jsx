import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Default configuration for useOnlineStatus
 */
export const ONLINE_STATUS_DEFAULTS = {
    HEALTH_CHECK_INTERVAL: 30000,  // 30 seconds
    STABILITY_DELAY: 2000,          // 2 seconds
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
 * @returns {Function} returns.checkNow - Force immediate health check
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

    const checkServer = useCallback(async () => {
        if (!healthCheckUrl) {
            return null;
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return false;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(healthCheckUrl, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch {
            return false;
        }
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
                isServerReachable: false,
                lastCheck: Date.now()
            }));
        }
    }, [checkServer, stabilityDelay, healthCheckUrl]);

    useEffect(() => {
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
        if (!healthCheckUrl || !healthCheckInterval || healthCheckInterval <= 0) {
            return;
        }

        healthCheckIntervalRef.current = setInterval(async () => {
            if (!mountedRef.current) return;

            const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
            if (!isCurrentlyOnline) return;

            const serverReachable = await checkServer();

            if (!mountedRef.current) return;

            setStatus(s => ({
                ...s,
                isServerReachable: serverReachable,
                lastCheck: Date.now()
            }));
        }, healthCheckInterval);

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

    const checkNow = useCallback(async () => {
        const serverReachable = await checkServer();
        const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (!mountedRef.current) {
            return { isOnline: isCurrentlyOnline, isServerReachable: serverReachable };
        }

        setStatus(s => ({
            ...s,
            isOnline: isCurrentlyOnline,
            isServerReachable: serverReachable,
            lastCheck: Date.now(),
            lastOnline: isCurrentlyOnline ? Date.now() : s.lastOnline
        }));

        return { isOnline: isCurrentlyOnline, isServerReachable: serverReachable };
    }, [checkServer]);

    return {
        isOnline: status.isOnline,
        isOffline: !status.isOnline,
        isServerReachable: status.isServerReachable,
        lastOnline: status.lastOnline,
        lastCheck: status.lastCheck,
        checkNow
    };
};
