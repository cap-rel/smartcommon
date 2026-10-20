import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { LibConfigContext } from 'lib/components/app/LibConfigProvider/context';
import {
    useOnlineStatus,
    ONLINE_STATUS_DEFAULTS,
    defaultHealthCheckUrl,
    resetHealthCheckCache
} from './index.jsx';

// LibConfigProvider stand-in carrying only the API prefix.
const withPrefixUrl = (prefixUrl) => {
    const PrefixUrlWrapper = ({ children }) => (
        <LibConfigContext.Provider value={{ api: { prefixUrl } }}>{children}</LibConfigContext.Provider>
    );
    return PrefixUrlWrapper;
};

describe('useOnlineStatus', () => {
    let originalNavigator;
    let originalWindow;

    beforeEach(() => {
        originalNavigator = global.navigator;
        originalWindow = global.window;

        global.navigator = { onLine: true };
        global.window = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };
        global.fetch = vi.fn();
        resetHealthCheckCache();

        vi.useFakeTimers();
    });

    afterEach(() => {
        global.navigator = originalNavigator;
        global.window = originalWindow;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should return isOnline: true when navigator.onLine is true', () => {
            global.navigator = { onLine: true };
            const { result } = renderHook(() => useOnlineStatus());

            expect(result.current.isOnline).toBe(true);
            expect(result.current.isOffline).toBe(false);
        });

        it('should return isOnline: false when navigator.onLine is false', () => {
            global.navigator = { onLine: false };
            const { result } = renderHook(() => useOnlineStatus());

            expect(result.current.isOnline).toBe(false);
            expect(result.current.isOffline).toBe(true);
        });

        it('should return isServerReachable: null when no healthCheckUrl', () => {
            const { result } = renderHook(() => useOnlineStatus());
            expect(result.current.isServerReachable).toBeNull();
        });

        it('should set lastOnline when initially online', () => {
            global.navigator = { onLine: true };
            const { result } = renderHook(() => useOnlineStatus());
            expect(result.current.lastOnline).not.toBeNull();
        });

        it('should not set lastOnline when initially offline', () => {
            global.navigator = { onLine: false };
            const { result } = renderHook(() => useOnlineStatus());
            expect(result.current.lastOnline).toBeNull();
        });
    });

    describe('event listeners', () => {
        it('should add online and offline event listeners', () => {
            renderHook(() => useOnlineStatus());

            expect(global.window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
            expect(global.window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
        });

        it('should remove event listeners on unmount', () => {
            const { unmount } = renderHook(() => useOnlineStatus());
            unmount();

            expect(global.window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
            expect(global.window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
        });

        it('should react to offline event immediately', () => {
            let offlineHandler;
            global.window.addEventListener = vi.fn((event, handler) => {
                if (event === 'offline') offlineHandler = handler;
            });

            const { result } = renderHook(() => useOnlineStatus());
            expect(result.current.isOnline).toBe(true);

            act(() => {
                global.navigator = { onLine: false };
                offlineHandler();
            });

            expect(result.current.isOnline).toBe(false);
            expect(result.current.isOffline).toBe(true);
        });

        it('should apply stability delay when going online', async () => {
            let onlineHandler;
            global.window.addEventListener = vi.fn((event, handler) => {
                if (event === 'online') onlineHandler = handler;
            });

            global.navigator = { onLine: false };
            const { result } = renderHook(() => useOnlineStatus({ stabilityDelay: 1000 }));

            expect(result.current.isOnline).toBe(false);

            act(() => {
                global.navigator = { onLine: true };
                onlineHandler();
            });

            expect(result.current.isOnline).toBe(false);

            await act(async () => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.isOnline).toBe(true);
        });
    });

    describe('health check', () => {
        it('should call health check URL when provided', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            await act(async () => {
                await result.current.checkNow();
            });

            expect(global.fetch).toHaveBeenCalledWith('/api/health', {
                method: 'HEAD',
                cache: 'no-store',
                signal: expect.any(AbortSignal)
            });
        });

        it('should set isServerReachable: true when health check succeeds', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            await act(async () => {
                await result.current.checkNow();
            });

            expect(result.current.isServerReachable).toBe(true);
        });

        it('should set isServerReachable: false when health check fails', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            await act(async () => {
                await result.current.checkNow();
            });

            expect(result.current.isServerReachable).toBe(false);
        });

        it('should set isServerReachable: false when fetch throws', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            await act(async () => {
                await result.current.checkNow();
            });

            expect(result.current.isServerReachable).toBe(false);
        });

        it('should return null for isServerReachable when no healthCheckUrl', async () => {
            const { result } = renderHook(() => useOnlineStatus());

            await act(async () => {
                await result.current.checkNow();
            });

            expect(result.current.isServerReachable).toBeNull();
        });

        it('should update lastCheck after health check', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            expect(result.current.lastCheck).toBeNull();

            await act(async () => {
                await result.current.checkNow();
            });

            expect(result.current.lastCheck).not.toBeNull();
        });
    });

    describe('periodic health check', () => {
        it('should probe once on mount', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            // Consumers gate work on isServerReachable (useSyncClient blocks
            // its periodic sync on it), so it must not stay null for a whole
            // interval after mount.
            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                healthCheckInterval: 5000
            }));

            expect(global.fetch).toHaveBeenCalledTimes(1);

            await act(async () => {});

            expect(result.current.isServerReachable).toBe(true);
        });

        it('should run health check at specified interval', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                healthCheckInterval: 5000
            }));

            // 1 = the mount probe.
            expect(global.fetch).toHaveBeenCalledTimes(1);
            // Let it settle: a tick firing while it is still in flight shares it.
            await act(async () => {});

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(2);

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should clear interval on unmount', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { unmount } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                healthCheckInterval: 5000
            }));
            await act(async () => {});

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            // mount probe + one tick.
            expect(global.fetch).toHaveBeenCalledTimes(2);

            unmount();

            await act(async () => {
                vi.advanceTimersByTime(10000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should not run health check when offline', async () => {
            global.navigator = { onLine: false };
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                healthCheckInterval: 5000
            }));

            await act(async () => {
                vi.advanceTimersByTime(10000);
            });

            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    describe('checkNow', () => {
        it('should resolve to server reachability when a healthCheckUrl is set', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            let checkResult;
            await act(async () => {
                checkResult = await result.current.checkNow();
            });

            // A boolean, not an object: `if (await checkNow())` must stay
            // meaningful for consumers.
            expect(checkResult).toBe(true);

            global.fetch = vi.fn().mockResolvedValue({ ok: false });

            await act(async () => {
                checkResult = await result.current.checkNow();
            });

            expect(checkResult).toBe(false);
        });

        it('should resolve to navigator.onLine when no healthCheckUrl is set', async () => {
            const { result } = renderHook(() => useOnlineStatus());

            let checkResult;
            await act(async () => {
                checkResult = await result.current.checkNow();
            });

            expect(checkResult).toBe(true);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should update lastOnline when online', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            const initialLastOnline = result.current.lastOnline;

            await act(async () => {
                vi.advanceTimersByTime(100);
                await result.current.checkNow();
            });

            expect(result.current.lastOnline).toBeGreaterThanOrEqual(initialLastOnline);
        });
    });

    describe('timeout', () => {
        it('should abort fetch when timeout is reached', async () => {
            let abortSignal;
            global.fetch = vi.fn((url, options) => {
                abortSignal = options.signal;
                return new Promise((resolve, reject) => {
                    abortSignal.addEventListener('abort', () => {
                        reject(new Error('Aborted'));
                    });
                });
            });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                timeout: 1000
            }));

            const checkPromise = act(async () => {
                const promise = result.current.checkNow();
                vi.advanceTimersByTime(1000);
                return promise;
            });

            await checkPromise;
            expect(result.current.isServerReachable).toBe(false);
        });
    });

    describe('cleanup', () => {
        it('should clear stability timeout on unmount', () => {
            let onlineHandler;
            global.window.addEventListener = vi.fn((event, handler) => {
                if (event === 'online') onlineHandler = handler;
            });

            global.navigator = { onLine: false };
            const { unmount } = renderHook(() => useOnlineStatus({ stabilityDelay: 5000 }));

            act(() => {
                global.navigator = { onLine: true };
                onlineHandler();
            });

            unmount();

            expect(() => {
                vi.advanceTimersByTime(5000);
            }).not.toThrow();
        });
    });

    describe('ONLINE_STATUS_DEFAULTS', () => {
        it('should export default values', () => {
            expect(ONLINE_STATUS_DEFAULTS.HEALTH_CHECK_INTERVAL).toBe(30000);
            expect(ONLINE_STATUS_DEFAULTS.STABILITY_DELAY).toBe(1000);
            expect(ONLINE_STATUS_DEFAULTS.TIMEOUT).toBe(5000);
        });
    });

    describe('default health route', () => {
        it('builds the URL from the API prefix', () => {
            expect(defaultHealthCheckUrl('/mymodule/pwa/api.php/')).toBe('/mymodule/pwa/api.php/health');
            expect(defaultHealthCheckUrl('https://erp.example.com/api.php')).toBe('https://erp.example.com/api.php/health');
            expect(defaultHealthCheckUrl('')).toBeNull();
            expect(defaultHealthCheckUrl(undefined)).toBeNull();
        });

        it('probes the SmartAuth health route of LibConfig when no URL is given', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 });

            const { result } = renderHook(() => useOnlineStatus(), { wrapper: withPrefixUrl('/mymodule/pwa/api.php/') });
            await act(async () => {});

            expect(global.fetch).toHaveBeenCalledWith('/mymodule/pwa/api.php/health', expect.objectContaining({ method: 'HEAD' }));
            expect(result.current.isServerReachable).toBe(true);
        });

        it('does not probe when the URL is explicitly null', async () => {
            const { result } = renderHook(() => useOnlineStatus({ healthCheckUrl: null }), { wrapper: withPrefixUrl('/api.php/') });
            await act(async () => {});

            expect(global.fetch).not.toHaveBeenCalled();
            expect(result.current.isServerReachable).toBeNull();
        });

        it('lets an explicit URL win over the default one', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            renderHook(() => useOnlineStatus({ healthCheckUrl: '/custom' }), { wrapper: withPrefixUrl('/api.php/') });
            await act(async () => {});

            expect(global.fetch.mock.calls[0][0]).toBe('/custom');
        });
    });

    describe('reachability rule', () => {
        it.each([
            [401, true],
            [404, true],
            [405, true],
            [500, false],
            [503, false]
        ])('treats HTTP %i as reachable=%s', async (status, expected) => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status });

            const { result } = renderHook(() => useOnlineStatus({ healthCheckUrl: '/api/health' }));
            await act(async () => {});

            expect(result.current.isServerReachable).toBe(expected);
        });
    });

    describe('shared probe', () => {
        it('sends one request for several instances on the same URL', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const first = renderHook(() => useOnlineStatus({ healthCheckUrl: '/api/health' }));
            const second = renderHook(() => useOnlineStatus({ healthCheckUrl: '/api/health' }));
            await act(async () => {});

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(first.result.current.isServerReachable).toBe(true);
            expect(second.result.current.isServerReachable).toBe(true);
        });

        it('reuses a recent answer for a periodic check, not for checkNow', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            renderHook(() => useOnlineStatus({ healthCheckUrl: '/api/health', healthCheckInterval: 10000 }));
            await act(async () => {});
            expect(global.fetch).toHaveBeenCalledTimes(1);

            // A second instance mounting 2s later: its mount probe is periodic
            const late = renderHook(() => useOnlineStatus({ healthCheckUrl: '/api/health', healthCheckInterval: 10000 }));
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(global.fetch).toHaveBeenCalledTimes(1);

            await act(async () => {
                await late.result.current.checkNow();
            });
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('keeps probes on different URLs separate', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            renderHook(() => useOnlineStatus({ healthCheckUrl: '/a/health' }));
            renderHook(() => useOnlineStatus({ healthCheckUrl: '/b/health' }));
            await act(async () => {});

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });
});
