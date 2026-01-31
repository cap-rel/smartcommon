import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formatBytes,
    isIndexedDBAvailable,
    getStorageEstimate,
    requestPersistentStorage,
    isStoragePersistent,
    STORAGE_CONSTANTS
} from './index.js';

describe('Storage Utilities', () => {

    describe('formatBytes', () => {
        it('should return "0 B" for 0 bytes', () => {
            expect(formatBytes(0)).toBe('0 B');
        });

        it('should format bytes correctly', () => {
            expect(formatBytes(1)).toBe('1 B');
            expect(formatBytes(500)).toBe('500 B');
        });

        it('should format kilobytes correctly', () => {
            expect(formatBytes(1024)).toBe('1 KB');
            expect(formatBytes(1536)).toBe('1.5 KB');
        });

        it('should format megabytes correctly', () => {
            expect(formatBytes(1048576)).toBe('1 MB');
            expect(formatBytes(1572864)).toBe('1.5 MB');
        });

        it('should format gigabytes correctly', () => {
            expect(formatBytes(1073741824)).toBe('1 GB');
        });

        it('should format terabytes correctly', () => {
            expect(formatBytes(1099511627776)).toBe('1 TB');
        });

        it('should handle invalid input gracefully', () => {
            expect(formatBytes(-1)).toBe('0 B');
            expect(formatBytes(NaN)).toBe('0 B');
            expect(formatBytes(undefined)).toBe('0 B');
            expect(formatBytes(null)).toBe('0 B');
            expect(formatBytes('string')).toBe('0 B');
        });
    });

    describe('isIndexedDBAvailable', () => {
        const originalIndexedDB = global.indexedDB;

        afterEach(() => {
            global.indexedDB = originalIndexedDB;
        });

        it('should return false when indexedDB is undefined', async () => {
            global.indexedDB = undefined;
            const result = await isIndexedDBAvailable();
            expect(result).toBe(false);
        });

        it('should return true when indexedDB.open succeeds', async () => {
            const mockResult = { close: vi.fn() };
            const mockRequest = {
                onsuccess: null,
                onerror: null,
                onblocked: null,
                result: mockResult
            };

            global.indexedDB = {
                open: vi.fn(() => {
                    setTimeout(() => mockRequest.onsuccess?.(), 0);
                    return mockRequest;
                }),
                deleteDatabase: vi.fn()
            };

            const result = await isIndexedDBAvailable();
            expect(result).toBe(true);
            expect(mockResult.close).toHaveBeenCalled();
            expect(global.indexedDB.deleteDatabase).toHaveBeenCalledWith(STORAGE_CONSTANTS.TEST_DB_NAME);
        });

        it('should return false when indexedDB.open fails', async () => {
            const mockRequest = {
                onsuccess: null,
                onerror: null,
                onblocked: null
            };

            global.indexedDB = {
                open: vi.fn(() => {
                    setTimeout(() => mockRequest.onerror?.(), 0);
                    return mockRequest;
                })
            };

            const result = await isIndexedDBAvailable();
            expect(result).toBe(false);
        });

        it('should return false when indexedDB is blocked', async () => {
            const mockRequest = {
                onsuccess: null,
                onerror: null,
                onblocked: null
            };

            global.indexedDB = {
                open: vi.fn(() => {
                    setTimeout(() => mockRequest.onblocked?.(), 0);
                    return mockRequest;
                })
            };

            const result = await isIndexedDBAvailable();
            expect(result).toBe(false);
        });
    });

    describe('getStorageEstimate', () => {
        const originalNavigator = global.navigator;

        beforeEach(() => {
            global.navigator = { ...originalNavigator };
        });

        afterEach(() => {
            global.navigator = originalNavigator;
        });

        it('should return null when Storage API is not available', async () => {
            global.navigator = {};
            const result = await getStorageEstimate();
            expect(result).toBeNull();
        });

        it('should return storage estimate with all properties', async () => {
            global.navigator = {
                storage: {
                    estimate: vi.fn().mockResolvedValue({
                        usage: 1048576,  // 1 MB
                        quota: 10485760  // 10 MB
                    })
                }
            };

            const result = await getStorageEstimate();

            expect(result).not.toBeNull();
            expect(result.usage).toBe(1048576);
            expect(result.quota).toBe(10485760);
            expect(result.available).toBe(9437184);
            expect(result.usagePercent).toBe(10);
            expect(result.usageFormatted).toBe('1 MB');
            expect(result.quotaFormatted).toBe('10 MB');
            expect(result.availableFormatted).toBe('9 MB');
        });

        it('should handle zero quota gracefully', async () => {
            global.navigator = {
                storage: {
                    estimate: vi.fn().mockResolvedValue({
                        usage: 0,
                        quota: 0
                    })
                }
            };

            const result = await getStorageEstimate();
            expect(result.usagePercent).toBe(0);
        });

        it('should return null when estimate throws', async () => {
            global.navigator = {
                storage: {
                    estimate: vi.fn().mockRejectedValue(new Error('Failed'))
                }
            };

            const result = await getStorageEstimate();
            expect(result).toBeNull();
        });
    });

    describe('requestPersistentStorage', () => {
        const originalNavigator = global.navigator;

        afterEach(() => {
            global.navigator = originalNavigator;
        });

        it('should return false when Storage API is not available', async () => {
            global.navigator = {};
            const result = await requestPersistentStorage();
            expect(result).toBe(false);
        });

        it('should return true when persist succeeds', async () => {
            global.navigator = {
                storage: {
                    persist: vi.fn().mockResolvedValue(true)
                }
            };

            const result = await requestPersistentStorage();
            expect(result).toBe(true);
        });

        it('should return false when persist is denied', async () => {
            global.navigator = {
                storage: {
                    persist: vi.fn().mockResolvedValue(false)
                }
            };

            const result = await requestPersistentStorage();
            expect(result).toBe(false);
        });

        it('should return false when persist throws', async () => {
            global.navigator = {
                storage: {
                    persist: vi.fn().mockRejectedValue(new Error('Failed'))
                }
            };

            const result = await requestPersistentStorage();
            expect(result).toBe(false);
        });
    });

    describe('isStoragePersistent', () => {
        const originalNavigator = global.navigator;

        afterEach(() => {
            global.navigator = originalNavigator;
        });

        it('should return false when Storage API is not available', async () => {
            global.navigator = {};
            const result = await isStoragePersistent();
            expect(result).toBe(false);
        });

        it('should return true when storage is persistent', async () => {
            global.navigator = {
                storage: {
                    persisted: vi.fn().mockResolvedValue(true)
                }
            };

            const result = await isStoragePersistent();
            expect(result).toBe(true);
        });

        it('should return false when storage is not persistent', async () => {
            global.navigator = {
                storage: {
                    persisted: vi.fn().mockResolvedValue(false)
                }
            };

            const result = await isStoragePersistent();
            expect(result).toBe(false);
        });

        it('should return false when persisted throws', async () => {
            global.navigator = {
                storage: {
                    persisted: vi.fn().mockRejectedValue(new Error('Failed'))
                }
            };

            const result = await isStoragePersistent();
            expect(result).toBe(false);
        });
    });

    describe('STORAGE_CONSTANTS', () => {
        it('should export LOW_STORAGE_THRESHOLD as 50 MB', () => {
            expect(STORAGE_CONSTANTS.LOW_STORAGE_THRESHOLD).toBe(50 * 1024 * 1024);
        });

        it('should export TEST_DB_NAME', () => {
            expect(STORAGE_CONSTANTS.TEST_DB_NAME).toBe('__idb_availability_test__');
        });
    });
});
