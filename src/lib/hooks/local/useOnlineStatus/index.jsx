import { useState, useEffect, useCallback, useRef, useContext } from 'react';
// Path import, not the lib/components barrel: that barrel re-exports
// components which import lib/hooks, a cycle Vitest resolves to undefined.
import { LibConfigContext } from 'lib/components/app/LibConfigProvider/context';
import { createLogger } from 'lib/utils';

const logger = createLogger('useOnlineStatus');

/**
 * Default configuration for useOnlineStatus
 */
export const ONLINE_STATUS_DEFAULTS = {
    HEALTH_CHECK_INTERVAL: 30000,  // 30 seconds
    STABILITY_DELAY: 1000,          // 1 second
    TIMEOUT: 5000                   // 5 seconds
};

/**
 * Public SmartAuth route answering 204 to GET and HEAD, without token,
 * database access nor request log.
 */
export const HEALTH_ROUTE = 'health';

/**
 * Health URL derived from the API prefix of LibConfig (`api.prefixUrl`),
 * null when there is none.
 * @param {string|undefined|null} prefixUrl
 * @returns {string|null}
 */
export const defaultHealthCheckUrl = (prefixUrl) => {
    if (typeof prefixUrl !== 'string' || prefixUrl.trim() === '') {
        return null;
    }
    return `${prefixUrl.trim().replace(/\/+$/, '')}/${HEALTH_ROUTE}`;
};

// One probe per URL for the whole app: every mounted instance shares the
// in-flight request and, for periodic checks, a recent answer. Without it a
// screen of N components each probing on its own sends N requests per tick.
const probes = new Map();

/** Forgets every shared probe result (tests, logout). */
export const resetHealthCheckCache = () => {
    probes.clear();
};

// The server is reachable as soon as it answers below 500: a 401/404 from an
// older SmartAuth without the health route still proves it is up, while a
// 5xx (SmartAuth disabled, proxy error) means it cannot serve requests.
const isReachableResponse = (response) => Boolean(response?.ok)
    || (typeof response?.status === 'number' && response.status < 500);

const probeServer = (url, timeout, maxAgeMs) => {
    let entry = probes.get(url);
    if (!entry) {
        entry = { inFlight: null, result: null, at: 0 };
        probes.set(url, entry);
    }
    if (entry.inFlight) {
        return entry.inFlight;
    }
    if (maxAgeMs > 0 && entry.at && Date.now() - entry.at < maxAgeMs) {
        return Promise.resolve(entry.result);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    entry.inFlight = fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
    })
        .then((response) => {
            const reachable = isReachableResponse(response);
            if (!reachable && entry.result !== false) {
                logger.warning(`Server unreachable: HEAD ${url} answered HTTP ${response?.status ?? '?'}`);
            }
            return reachable;
        })
        .catch((error) => {
            if (entry.result !== false) {
                logger.warning(`Server unreachable: HEAD ${url} failed:`, error?.name === 'AbortError' ? `timeout after ${timeout}ms` : error);
            }
            return false;
        })
        .then((reachable) => {
            // Cleared on both paths: an aborted or failed request used to
            // leave its timer running.
            clearTimeout(timeoutId);
            entry.result = reachable;
            entry.at = Date.now();
            entry.inFlight = null;
            return reachable;
        });

    return entry.inFlight;
};

/**
 * Hook for robust online/offline detection with optional server health check
 *
 * Detects network connectivity changes and optionally verifies server reachability.
 * Includes a stability delay to prevent rapid oscillations when going online.
 *
 * @param {Object} options - Configuration options
 * @param {string|null} [options.healthCheckUrl] - URL to check server reachability.
 *   Omitted: the SmartAuth `health` route under LibConfig `api.prefixUrl` (no probe
 *   without a prefixUrl). null: no probe. Probed with an unauthenticated HEAD,
 *   shared by every instance using the same URL; any answer below 500 counts
 *   as reachable.
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
 * // Network only, no server probe
 * const { isOnline } = useOnlineStatus({ healthCheckUrl: null });
 *
 * @example
 * // Custom probe URL and interval
 * const { isOnline, isServerReachable, checkNow } = useOnlineStatus({
 *     healthCheckUrl: '/api/health',
 *     healthCheckInterval: 60000
 * });
 */
export const useOnlineStatus = ({
    healthCheckUrl: healthCheckUrlOption,
    healthCheckInterval = ONLINE_STATUS_DEFAULTS.HEALTH_CHECK_INTERVAL,
    stabilityDelay = ONLINE_STATUS_DEFAULTS.STABILITY_DELAY,
    timeout = ONLINE_STATUS_DEFAULTS.TIMEOUT
} = {}) => {
    const libConfig = useContext(LibConfigContext);
    const healthCheckUrl = healthCheckUrlOption === undefined
        ? defaultHealthCheckUrl(libConfig?.api?.prefixUrl)
        : healthCheckUrlOption;

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
    // `shared`: periodic checks may reuse an answer younger than half the
    // interval; explicit checks (back online, checkNow) always ask again.
    const checkServer = useCallback((shared = false) => {
        if (!healthCheckUrl) {
            return Promise.resolve(null);
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return Promise.resolve(false);
        }

        const maxAgeMs = shared && healthCheckInterval > 0 ? healthCheckInterval / 2 : 0;
        return probeServer(healthCheckUrl, timeout, maxAgeMs);
    }, [healthCheckUrl, timeout, healthCheckInterval]);

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

            checkServer(true).then((serverReachable) => {
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
