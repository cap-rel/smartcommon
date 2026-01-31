import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
    useAuthenticatedImage,
    generateCacheKey,
    AUTHENTICATED_IMAGE_DEFAULTS
} from './index.jsx';

vi.mock('../useOnlineStatus', () => ({
    useOnlineStatus: vi.fn(() => ({ isOnline: true }))
}));

import { useOnlineStatus } from '../useOnlineStatus';

describe('useAuthenticatedImage', () => {
    let mockDb;
    let mockStore;
    let cachedData;
    let mockBlob;
    let createdObjectUrls;

    beforeEach(() => {
        cachedData = {};
        createdObjectUrls = [];
        mockBlob = new Blob(['test'], { type: 'image/png' });

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
            imageCache: mockStore
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(mockBlob)
        });

        global.URL.createObjectURL = vi.fn((blob) => {
            const url = `blob:test-${createdObjectUrls.length}`;
            createdObjectUrls.push(url);
            return url;
        });

        global.URL.revokeObjectURL = vi.fn();

        useOnlineStatus.mockReturnValue({ isOnline: true });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cachedData = {};
        createdObjectUrls = [];
    });

    describe('generateCacheKey', () => {
        it('should return null for empty url', () => {
            expect(generateCacheKey(null)).toBeNull();
            expect(generateCacheKey('')).toBeNull();
            expect(generateCacheKey(undefined)).toBeNull();
        });

        it('should generate consistent keys for same URL', () => {
            const url = 'https://example.com/image.png';
            expect(generateCacheKey(url)).toBe(generateCacheKey(url));
        });

        it('should generate different keys for different URLs', () => {
            expect(generateCacheKey('/image1.png')).not.toBe(generateCacheKey('/image2.png'));
        });

        it('should handle URLs with special characters', () => {
            const urlWithSpecial = 'https://example.com/image?name=été&size=100';
            const key = generateCacheKey(urlWithSpecial);
            expect(key).toBeTruthy();
            expect(key.startsWith('img_')).toBe(true);
        });

        it('should handle URLs with unicode', () => {
            const urlWithUnicode = 'https://example.com/画像.png';
            const key = generateCacheKey(urlWithUnicode);
            expect(key).toBeTruthy();
            expect(key.startsWith('img_')).toBe(true);
        });
    });

    describe('initial state', () => {
        it('should show placeholder when no url', () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                placeholder: '/default.png'
            }));

            expect(result.current.src).toBe('/default.png');
            expect(result.current.isLoading).toBe(false);
        });

        it('should start loading when url provided', () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/image.png'
            }));

            expect(result.current.isLoading).toBe(true);
        });
    });

    describe('fetching', () => {
        it('should fetch image with Authorization header when token provided', async () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/image.png',
                token: 'my-jwt-token'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(global.fetch).toHaveBeenCalledWith('/api/image.png', {
                headers: { Authorization: 'Bearer my-jwt-token' }
            });
        });

        it('should fetch without Authorization when no token', async () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/image.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(global.fetch).toHaveBeenCalledWith('/api/image.png', {
                headers: {}
            });
        });

        it('should create blob URL from fetched image', async () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/image.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
            expect(result.current.src).toBe('blob:test-0');
            expect(result.current.isFromCache).toBe(false);
        });

        it('should cache fetched image', async () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/image.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockStore.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    blob: mockBlob,
                    url: '/api/image.png'
                })
            );
        });
    });

    describe('cache behavior', () => {
        it('should use cached image when available', async () => {
            const cacheKey = generateCacheKey('/api/cached.png');
            cachedData[cacheKey] = {
                key: cacheKey,
                blob: mockBlob,
                url: '/api/cached.png',
                cachedAt: Date.now()
            };

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/cached.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isFromCache).toBe(true);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should delete expired cache and fetch fresh', async () => {
            const cacheKey = generateCacheKey('/api/expired.png');
            cachedData[cacheKey] = {
                key: cacheKey,
                blob: mockBlob,
                url: '/api/expired.png',
                cachedAt: Date.now() - 100000000 // Very old
            };

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/expired.png',
                ttl: 1000 // 1 second
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockStore.delete).toHaveBeenCalledWith(cacheKey);
            expect(global.fetch).toHaveBeenCalled();
        });

        it('should refresh stale cache in background', async () => {
            const cacheKey = generateCacheKey('/api/stale.png');
            cachedData[cacheKey] = {
                key: cacheKey,
                blob: mockBlob,
                url: '/api/stale.png',
                cachedAt: Date.now() - 7200000 // 2 hours ago
            };

            let resolveFetch;
            global.fetch = vi.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    resolveFetch = () => resolve({
                        ok: true,
                        blob: () => Promise.resolve(mockBlob)
                    });
                });
            });

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/stale.png',
                ttl: 86400000,    // 24h
                staleTime: 3600000 // 1h
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should show cache immediately while fetch is pending
            expect(result.current.isFromCache).toBe(true);

            // Background fetch should have been triggered
            expect(global.fetch).toHaveBeenCalled();

            // Resolve background fetch
            await act(async () => {
                resolveFetch();
                await new Promise(r => setTimeout(r, 50));
            });
        });
    });

    describe('offline behavior', () => {
        it('should use cache when offline', async () => {
            useOnlineStatus.mockReturnValue({ isOnline: false });

            const cacheKey = generateCacheKey('/api/offline.png');
            cachedData[cacheKey] = {
                key: cacheKey,
                blob: mockBlob,
                url: '/api/offline.png',
                cachedAt: Date.now()
            };

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/offline.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isFromCache).toBe(true);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should show placeholder when offline and no cache', async () => {
            useOnlineStatus.mockReturnValue({ isOnline: false });

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/no-cache.png',
                placeholder: '/default.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.src).toBe('/default.png');
            expect(result.current.error).not.toBeNull();
        });
    });

    describe('error handling', () => {
        it('should handle HTTP errors', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404
            });

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/not-found.png',
                placeholder: '/default.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).not.toBeNull();
            expect(result.current.error.message).toContain('404');
            expect(result.current.src).toBe('/default.png');
        });

        it('should handle network errors', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/error.png',
                placeholder: '/default.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).not.toBeNull();
            expect(result.current.src).toBe('/default.png');
        });

        it('should handle missing db gracefully', async () => {
            const { result } = renderHook(() => useAuthenticatedImage({
                db: null,
                url: '/api/image.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.src).toBe('blob:test-0');
        });
    });

    describe('cleanup', () => {
        it('should revoke blob URL on unmount', async () => {
            const { result, unmount } = renderHook(() => useAuthenticatedImage({
                db: mockDb,
                url: '/api/image.png'
            }));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            unmount();

            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });

        it('should revoke old URL when new image loads', async () => {
            const { result, rerender } = renderHook(
                ({ url }) => useAuthenticatedImage({
                    db: mockDb,
                    url
                }),
                { initialProps: { url: '/api/image1.png' } }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const firstUrl = result.current.src;

            rerender({ url: '/api/image2.png' });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });

    describe('constants', () => {
        it('should export AUTHENTICATED_IMAGE_DEFAULTS', () => {
            expect(AUTHENTICATED_IMAGE_DEFAULTS.TTL).toBe(86400000);
            expect(AUTHENTICATED_IMAGE_DEFAULTS.STALE_TIME).toBe(3600000);
        });
    });
});
