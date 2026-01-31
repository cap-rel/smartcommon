import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineStatus, ONLINE_STATUS_DEFAULTS } from './index.jsx';

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
        it('should run health check at specified interval', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                healthCheckInterval: 5000
            }));

            expect(global.fetch).not.toHaveBeenCalled();

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(1);

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should clear interval on unmount', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { unmount } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health',
                healthCheckInterval: 5000
            }));

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(1);

            unmount();

            await act(async () => {
                vi.advanceTimersByTime(10000);
            });

            expect(global.fetch).toHaveBeenCalledTimes(1);
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
        it('should return current status', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useOnlineStatus({
                healthCheckUrl: '/api/health'
            }));

            let checkResult;
            await act(async () => {
                checkResult = await result.current.checkNow();
            });

            expect(checkResult).toEqual({
                isOnline: true,
                isServerReachable: true
            });
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
            expect(ONLINE_STATUS_DEFAULTS.STABILITY_DELAY).toBe(2000);
            expect(ONLINE_STATUS_DEFAULTS.TIMEOUT).toBe(5000);
        });
    });
});
