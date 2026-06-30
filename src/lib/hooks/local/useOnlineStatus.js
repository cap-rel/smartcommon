import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to track online/offline status with optional server health check
 *
 * @param {Object} options
 * @param {string} [options.healthCheckUrl] - URL to ping for server reachability check
 * @param {number} [options.healthCheckInterval=30000] - Interval between health checks (ms)
 * @param {number} [options.stabilityDelay=1000] - Delay before confirming online status (ms)
 * @returns {Object} Online status information
 */
export function useOnlineStatus(options = {}) {
    const {
        healthCheckUrl,
        healthCheckInterval = 30000,
        stabilityDelay = 1000,
    } = options;

    const [isOnline, setIsOnline] = useState(() => navigator.onLine);
    const [lastOnline, setLastOnline] = useState(() =>
        navigator.onLine ? Date.now() : null
    );
    const [isServerReachable, setIsServerReachable] = useState(null);
    const [lastCheck, setLastCheck] = useState(null);

    const stabilityTimeoutRef = useRef(null);
    const healthCheckIntervalRef = useRef(null);

    const checkServerHealth = useCallback(async () => {
        if (!healthCheckUrl) {
            return null;
        }

        try {
            const response = await fetch(healthCheckUrl, {
                method: "HEAD",
                cache: "no-store",
            });
            const reachable = response.ok;
            setIsServerReachable(reachable);
            setLastCheck(Date.now());
            return reachable;
        } catch {
            setIsServerReachable(false);
            setLastCheck(Date.now());
            return false;
        }
    }, [healthCheckUrl]);

    const checkNow = useCallback(async () => {
        const navigatorOnline = navigator.onLine;
        setIsOnline(navigatorOnline);
        if (navigatorOnline) {
            setLastOnline(Date.now());
        }
        if (healthCheckUrl) {
            return await checkServerHealth();
        }
        return navigatorOnline;
    }, [healthCheckUrl, checkServerHealth]);

    useEffect(() => {
        const handleOnline = () => {
            if (stabilityTimeoutRef.current) {
                clearTimeout(stabilityTimeoutRef.current);
            }

            stabilityTimeoutRef.current = setTimeout(() => {
                if (navigator.onLine) {
                    setIsOnline(true);
                    setLastOnline(Date.now());
                    if (healthCheckUrl) {
                        checkServerHealth();
                    }
                }
            }, stabilityDelay);
        };

        const handleOffline = () => {
            if (stabilityTimeoutRef.current) {
                clearTimeout(stabilityTimeoutRef.current);
            }
            setIsOnline(false);
            setIsServerReachable(healthCheckUrl ? false : null);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial health check if URL provided
        if (healthCheckUrl && navigator.onLine) {
            checkServerHealth();

            // Set up periodic health checks
            healthCheckIntervalRef.current = setInterval(() => {
                if (navigator.onLine) {
                    checkServerHealth();
                }
            }, healthCheckInterval);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);

            if (stabilityTimeoutRef.current) {
                clearTimeout(stabilityTimeoutRef.current);
            }
            if (healthCheckIntervalRef.current) {
                clearInterval(healthCheckIntervalRef.current);
            }
        };
    }, [healthCheckUrl, healthCheckInterval, stabilityDelay, checkServerHealth]);

    return {
        isOnline,
        isOffline: !isOnline,
        lastOnline,
        isServerReachable,
        lastCheck,
        checkNow,
    };
}
