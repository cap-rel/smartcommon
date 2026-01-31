/**
 * Storage utilities for offline mode
 * Provides IndexedDB availability checks, quota management, and persistent storage
 * @module utils/storage
 */

/**
 * Default constants for storage management
 */
export const STORAGE_CONSTANTS = {
    LOW_STORAGE_THRESHOLD: 50 * 1024 * 1024, // 50 MB
    TEST_DB_NAME: '__idb_availability_test__'
};

/**
 * Formats bytes into human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 * @example
 * formatBytes(0)        // "0 B"
 * formatBytes(1024)     // "1 KB"
 * formatBytes(1536000)  // "1.46 MB"
 */
export const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const index = Math.min(i, sizes.length - 1);

    return parseFloat((bytes / Math.pow(k, index)).toFixed(2)) + ' ' + sizes[index];
};

/**
 * Checks if IndexedDB is available
 * May return false in private browsing mode or when storage is disabled
 * @returns {Promise<boolean>} True if IndexedDB is available and writable
 * @example
 * const available = await isIndexedDBAvailable();
 * if (!available) {
 *     console.warn('Offline mode disabled - IndexedDB not available');
 * }
 */
export const isIndexedDBAvailable = async () => {
    if (typeof indexedDB === 'undefined') {
        return false;
    }

    try {
        const testDbName = STORAGE_CONSTANTS.TEST_DB_NAME;

        return new Promise((resolve) => {
            const request = indexedDB.open(testDbName);

            request.onerror = () => {
                resolve(false);
            };

            request.onsuccess = () => {
                try {
                    request.result.close();
                    indexedDB.deleteDatabase(testDbName);
                    resolve(true);
                } catch {
                    resolve(false);
                }
            };

            request.onblocked = () => {
                resolve(false);
            };
        });
    } catch {
        return false;
    }
};

/**
 * Estimates available storage space using the Storage API
 * @returns {Promise<StorageEstimate|null>} Storage estimate or null if not supported
 * @typedef {Object} StorageEstimate
 * @property {number} usage - Bytes currently used
 * @property {number} quota - Total bytes available
 * @property {number} usagePercent - Percentage of quota used (0-100)
 * @property {number} available - Bytes available
 * @property {string} usageFormatted - Human-readable usage
 * @property {string} quotaFormatted - Human-readable quota
 * @property {string} availableFormatted - Human-readable available space
 * @example
 * const estimate = await getStorageEstimate();
 * if (estimate && estimate.available < 50 * 1024 * 1024) {
 *     console.warn('Low storage:', estimate.availableFormatted);
 * }
 */
export const getStorageEstimate = async () => {
    if (typeof navigator === 'undefined' ||
        !('storage' in navigator) ||
        !('estimate' in navigator.storage)) {
        return null;
    }

    try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const available = quota - usage;

        return {
            usage,
            quota,
            usagePercent: quota > 0 ? Math.round((usage / quota) * 100) : 0,
            available,
            usageFormatted: formatBytes(usage),
            quotaFormatted: formatBytes(quota),
            availableFormatted: formatBytes(available)
        };
    } catch {
        return null;
    }
};

/**
 * Requests persistent storage to prevent browser eviction
 * User may be prompted for permission
 * @returns {Promise<boolean>} True if persistent storage was granted
 * @example
 * const persisted = await requestPersistentStorage();
 * console.log('Storage is persistent:', persisted);
 */
export const requestPersistentStorage = async () => {
    if (typeof navigator === 'undefined' ||
        !('storage' in navigator) ||
        !('persist' in navigator.storage)) {
        return false;
    }

    try {
        return await navigator.storage.persist();
    } catch {
        return false;
    }
};

/**
 * Checks if storage is currently persistent
 * @returns {Promise<boolean>} True if storage is persistent
 * @example
 * const isPersistent = await isStoragePersistent();
 * if (!isPersistent) {
 *     await requestPersistentStorage();
 * }
 */
export const isStoragePersistent = async () => {
    if (typeof navigator === 'undefined' ||
        !('storage' in navigator) ||
        !('persisted' in navigator.storage)) {
        return false;
    }

    try {
        return await navigator.storage.persisted();
    } catch {
        return false;
    }
};
