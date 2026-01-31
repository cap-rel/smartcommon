import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCachedQuery, CACHE_STRATEGIES, CACHED_QUERY_DEFAULTS } from './index.jsx';

vi.mock('../useOnlineStatus', () => ({
    useOnlineStatus: vi.fn(() => ({ isOnline: true }))
}));

import { useOnlineStatus } from '../useOnlineStatus';

describe('useCachedQuery', () => {
    let mockDb;
    let mockStore;
    let cachedData;

    beforeEach(() => {
        cachedData = {};
        mockStore = {
            get: vi.fn((key) => Promise.resolve(cachedData[key] || null)),
            put: vi.fn((record) => {
                cachedData[record.key] = record;
                return Promise.resolve();
            }),
            delete: vi.fn((key) => {
                delete cachedData[key];
                return Promise.resolve();
            })
        };
        mockDb = {
            queryCache: mockStore
        };

        useOnlineStatus.mockReturnValue({ isOnline: true });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cachedData = {};
    });

    describe('initial state', () => {
        it('should start with isLoading: true', () => {
            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn: () => Promise.resolve({ data: 'test' })
            }));

            expect(result.current.isLoading).toBe(true);
        });

        it('should not fetch when enabled is false', async () => {
            const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                enabled: false
            }));

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            expect(fetchFn).not.toHaveBeenCalled();
        });
    });

    describe('NETWORK_FIRST strategy', () => {
        it('should fetch from network when online', async () => {
            const fetchFn = vi.fn().mockResolvedValue({ data: 'from network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.NETWORK_FIRST
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'from network' });
            expect(result.current.isFromCache).toBe(false);
            expect(fetchFn).toHaveBeenCalled();
        });

        it('should cache the result after fetching', async () => {
            const fetchFn = vi.fn().mockResolvedValue({ data: 'cached' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test-cache',
                fetchFn,
                strategy: CACHE_STRATEGIES.NETWORK_FIRST
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockStore.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: 'test-cache',
                    data: { data: 'cached' }
                })
            );
        });

        it('should fallback to cache when network fails', async () => {
            cachedData['test'] = {
                key: 'test',
                data: { data: 'from cache' },
                cachedAt: Date.now()
            };

            const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.NETWORK_FIRST
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'from cache' });
            expect(result.current.isFromCache).toBe(true);
            expect(result.current.isStale).toBe(true);
        });

        it('should use cache when offline', async () => {
            useOnlineStatus.mockReturnValue({ isOnline: false });

            cachedData['test'] = {
                key: 'test',
                data: { data: 'offline cache' },
                cachedAt: Date.now()
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.NETWORK_FIRST
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'offline cache' });
            expect(result.current.isFromCache).toBe(true);
            expect(fetchFn).not.toHaveBeenCalled();
        });

        it('should return error when offline and no cache', async () => {
            useOnlineStatus.mockReturnValue({ isOnline: false });

            const fetchFn = vi.fn().mockResolvedValue({ data: 'network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'no-cache',
                fetchFn,
                strategy: CACHE_STRATEGIES.NETWORK_FIRST
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).not.toBeNull();
            expect(result.current.error.message).toContain('offline');
        });
    });

    describe('CACHE_FIRST strategy', () => {
        it('should use fresh cache without fetching', async () => {
            cachedData['test'] = {
                key: 'test',
                data: { data: 'fresh cache' },
                cachedAt: Date.now()
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.CACHE_FIRST,
                staleTime: 60000
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'fresh cache' });
            expect(result.current.isFromCache).toBe(true);
            expect(result.current.isStale).toBe(false);
            expect(fetchFn).not.toHaveBeenCalled();
        });

        it('should fetch when cache is stale', async () => {
            cachedData['test'] = {
                key: 'test',
                data: { data: 'stale cache' },
                cachedAt: Date.now() - 120000 // 2 minutes ago
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'fresh network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.CACHE_FIRST,
                staleTime: 60000 // 1 minute
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'fresh network' });
            expect(result.current.isFromCache).toBe(false);
            expect(fetchFn).toHaveBeenCalled();
        });

        it('should use stale cache when offline', async () => {
            useOnlineStatus.mockReturnValue({ isOnline: false });

            cachedData['test'] = {
                key: 'test',
                data: { data: 'stale offline' },
                cachedAt: Date.now() - 120000
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.CACHE_FIRST,
                staleTime: 60000
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'stale offline' });
            expect(result.current.isFromCache).toBe(true);
            expect(result.current.isStale).toBe(true);
        });
    });

    describe('STALE_WHILE_REVALIDATE strategy', () => {
        it('should return cache immediately and revalidate if stale', async () => {
            cachedData['test'] = {
                key: 'test',
                data: { data: 'stale swr' },
                cachedAt: Date.now() - 120000
            };

            let resolveFetch;
            const fetchFn = vi.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    resolveFetch = () => resolve({ data: 'revalidated' });
                });
            });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
                staleTime: 60000
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // First shows cache immediately
            expect(result.current.data).toEqual({ data: 'stale swr' });
            expect(result.current.isFromCache).toBe(true);
            expect(result.current.isStale).toBe(true);

            // Now resolve the background fetch
            await act(async () => {
                resolveFetch();
                await new Promise(r => setTimeout(r, 50));
            });

            // Then revalidates in background
            await waitFor(() => {
                expect(result.current.data).toEqual({ data: 'revalidated' });
            });

            expect(result.current.isFromCache).toBe(false);
            expect(result.current.isStale).toBe(false);
        });

        it('should not revalidate fresh cache', async () => {
            cachedData['test'] = {
                key: 'test',
                data: { data: 'fresh swr' },
                cachedAt: Date.now()
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
                staleTime: 60000
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'fresh swr' });
            expect(result.current.isStale).toBe(false);
            expect(fetchFn).not.toHaveBeenCalled();
        });

        it('should not revalidate when offline', async () => {
            useOnlineStatus.mockReturnValue({ isOnline: false });

            cachedData['test'] = {
                key: 'test',
                data: { data: 'offline swr' },
                cachedAt: Date.now() - 120000
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'network' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
                staleTime: 60000
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(result.current.data).toEqual({ data: 'offline swr' });
            expect(fetchFn).not.toHaveBeenCalled();
        });
    });

    describe('TTL expiration', () => {
        it('should delete expired cache and fetch fresh', async () => {
            cachedData['test'] = {
                key: 'test',
                data: { data: 'expired' },
                cachedAt: Date.now() - 7200000 // 2 hours ago
            };

            const fetchFn = vi.fn().mockResolvedValue({ data: 'fresh' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn,
                ttl: 3600000 // 1 hour
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockStore.delete).toHaveBeenCalledWith('test');
            expect(result.current.data).toEqual({ data: 'fresh' });
        });
    });

    describe('invalidate', () => {
        it('should delete cache and refetch', async () => {
            const fetchFn = vi.fn()
                .mockResolvedValueOnce({ data: 'first' })
                .mockResolvedValueOnce({ data: 'second' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'first' });

            await act(async () => {
                await result.current.invalidate();
            });

            await waitFor(() => {
                expect(result.current.data).toEqual({ data: 'second' });
            });

            expect(mockStore.delete).toHaveBeenCalledWith('test');
        });
    });

    describe('refetch', () => {
        it('should refetch data', async () => {
            const fetchFn = vi.fn()
                .mockResolvedValueOnce({ data: 'first' })
                .mockResolvedValueOnce({ data: 'second' });

            const { result } = renderHook(() => useCachedQuery({
                db: mockDb,
                store: 'queryCache',
                key: 'test',
                fetchFn
            }));

            await waitFor(() => {
                expect(result.current.data).toEqual({ data: 'first' });
            });

            await act(async () => {
                await result.current.refetch();
            });

            await waitFor(() => {
                expect(result.current.data).toEqual({ data: 'second' });
            });
        });
    });

    describe('error handling', () => {
        it('should handle missing db gracefully', async () => {
            const fetchFn = vi.fn().mockResolvedValue({ data: 'no db' });

            const { result } = renderHook(() => useCachedQuery({
                db: null,
                store: 'queryCache',
                key: 'test',
                fetchFn
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'no db' });
        });

        it('should handle missing store gracefully', async () => {
            const fetchFn = vi.fn().mockResolvedValue({ data: 'no store' });

            const { result } = renderHook(() => useCachedQuery({
                db: {},
                store: 'nonexistent',
                key: 'test',
                fetchFn
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ data: 'no store' });
        });
    });

    describe('constants', () => {
        it('should export CACHE_STRATEGIES', () => {
            expect(CACHE_STRATEGIES.NETWORK_FIRST).toBe('network-first');
            expect(CACHE_STRATEGIES.CACHE_FIRST).toBe('cache-first');
            expect(CACHE_STRATEGIES.STALE_WHILE_REVALIDATE).toBe('swr');
        });

        it('should export CACHED_QUERY_DEFAULTS', () => {
            expect(CACHED_QUERY_DEFAULTS.TTL).toBe(3600000);
            expect(CACHED_QUERY_DEFAULTS.STALE_TIME).toBe(60000);
        });
    });
});
