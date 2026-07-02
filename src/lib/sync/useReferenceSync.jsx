import { useState, useCallback, useRef, useEffect } from "react";
import { useApi } from "lib/hooks";
import { createLogger } from "lib/utils";
import { downloadBundle } from "../utils/functions/zipBundle";

/**
 * useReferenceSync - config-driven, pull-only offline reference catalog sync.
 *
 * Orchestrates the synchronization of a reference dataset (products,
 * categories, thirdparties, contacts + their images/PDF documents) from a
 * Dolibarr backend through SmartAuth sync endpoints, into the consumer
 * module's own Dexie stores.
 *
 * This is the generic core extracted from offlinepropale's hand-written
 * useSyncService.jsx. Business push (proposals, field uploads...) stays in
 * each module: this hook is strictly pull-only.
 *
 * It complements useSyncClient (low-level transactional push/pull with its
 * own Dexie database): useReferenceSync writes into the module's OWN indexed
 * stores, which the app queries directly.
 *
 * Usage:
 *
 * const {
 *     isSyncing, syncProgress, lastSyncAt, error,
 *     syncNow, resetSync,
 * } = useReferenceSync({
 *     db,                    // module's Dexie instance
 *     appVersion: "1.2.3",   // sent to sync/register
 *     entities: [
 *         { objectType: "product",  store: "products",   mapper: mapProduct },
 *         { objectType: "category", store: "categories", mapper: mapCategory, cleanOrphans: true },
 *     ],
 *     documents: [
 *         { objectType: "product",  store: "productDocuments",  fk: "product_id",
 *           doctypes: (prefs) => [prefs.syncImages && "image", prefs.syncPdfs && "pdf"].filter(Boolean),
 *           enabled: (prefs) => prefs.syncProductDocuments },
 *         { objectType: "category", store: "categoryDocuments", fk: "category_id", doctypes: ["image"] },
 *     ],
 *     dataFeeds: [
 *         { key: "paymentModes", endpoint: "syncdata/payment-modes", store: "paymentModes" },
 *     ],
 *     metaStore: "syncMeta",  // key/value store ({ key, value }) for clientUuid + timestamps
 *     getSyncPreferences,     // optional: async () => ({ syncImages, syncPdfs, ... })
 *     onProgress,             // optional: (progress|null) => void
 * });
 */

const logger = createLogger("useReferenceSync");

/**
 * Default timeout for API requests in milliseconds (30 seconds)
 */
const API_TIMEOUT_MS = 30000;

/**
 * Page size for paginated sync/pull requests
 */
export const PULL_PAGE_SIZE = 500;

/**
 * Checks if an error is a 403 Forbidden error.
 * Sync stops immediately on 403 to avoid firewall blacklisting.
 */
export const isForbiddenError = (err) => {
    if (err?.response?.status === 403) return true;
    if (err?.status === 403) return true;
    if (err?.message?.includes("403")) return true;
    return false;
};

/**
 * Custom error class for 403 errors to stop sync loops immediately
 */
export class ForbiddenSyncError extends Error {
    constructor(message = "Access forbidden (403) - sync stopped to prevent firewall blacklisting") {
        super(message);
        this.name = "ForbiddenSyncError";
        this.isForbidden = true;
    }
}

/**
 * Normalize a timestamp value (ISO string or unix int) to unix seconds.
 * Handles migration from old ISO format to new unix timestamp format.
 */
export const toUnixTimestamp = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const ms = new Date(value).getTime();
        return isNaN(ms) ? 0 : Math.floor(ms / 1000);
    }
    return 0;
};

/**
 * Creates a combined AbortSignal with timeout.
 *
 * @param {AbortSignal|null} existingSignal - Existing signal from parent AbortController
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns {Object} { signal, cleanup } - Combined signal and cleanup function
 */
export const createTimeoutSignal = (existingSignal, timeoutMs = API_TIMEOUT_MS) => {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
        timeoutController.abort(new DOMException("Request timeout", "TimeoutError"));
    }, timeoutMs);

    // If existing signal aborts, abort the timeout controller too
    const onExistingAbort = () => {
        clearTimeout(timeoutId);
        timeoutController.abort(existingSignal.reason);
    };

    if (existingSignal) {
        existingSignal.addEventListener("abort", onExistingAbort);
    }

    const cleanup = () => {
        clearTimeout(timeoutId);
        if (existingSignal) {
            existingSignal.removeEventListener("abort", onExistingAbort);
        }
    };

    return {
        signal: timeoutController.signal,
        cleanup
    };
};

const throwIfAborted = (signal) => {
    if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
    }
};

/**
 * Reads a value from the key/value meta store ({ key, value } rows).
 * Returns null on any failure (logged).
 */
const readMeta = async (db, metaStore, key) => {
    try {
        const row = await db[metaStore]?.get(key);
        return row?.value ?? null;
    } catch (err) {
        logger.error(`Error reading meta key "${key}":`, err);
        return null;
    }
};

/**
 * Writes a value into the key/value meta store. Failures are logged.
 */
const writeMeta = async (db, metaStore, key, value) => {
    try {
        await db[metaStore]?.put({ key, value });
    } catch (err) {
        logger.error(`Error writing meta key "${key}":`, err);
    }
};

/**
 * Pulls one entity type through the paginated SmartAuth sync/pull endpoint
 * and writes it into the module's own Dexie store.
 *
 * Pagination contract:
 * - loops with limit/offset until response.has_more is falsy (a backend
 *   without pagination simply omits has_more: single-page pull),
 * - tombstones (response.deleted) are applied on the first page only,
 * - the per-type delta timestamp is persisted ONLY after the last page
 *   succeeded, so a crash mid-pagination re-pulls from the previous marker
 *   (no gap).
 *
 * Delta markers are stored per objectType (meta key "lastSyncAt_<type>") so
 * each entity keeps an independent delta window. The next last_sync_at value
 * is the server_time echoed by the backend when available, otherwise the
 * client clock captured BEFORE the first request (conservative: overlaps
 * rather than misses).
 *
 * cleanOrphans mode (small datasets like categories) always performs a full
 * pull and deletes local entries missing from the server response.
 *
 * @param {Object} params
 * @param {Object} params.api - Authenticated ky instance (useApi().private)
 * @param {Object} params.db - Dexie database of the consumer module
 * @param {string} params.metaStore - Name of the key/value meta store
 * @param {Object} params.entity - { objectType, store, mapper?, cleanOrphans? }
 * @param {string} params.clientUuid - Registered sync client UUID
 * @param {AbortSignal|null} params.signal - Abort signal
 * @param {Function|null} params.onProgress - ({ step, current, total }) => void
 * @param {number} params.pageSize - Pull page size
 * @returns {Promise<number>} Number of upserted entities
 */
export const pullEntityType = async ({
    api,
    db,
    metaStore,
    entity,
    clientUuid,
    signal = null,
    onProgress = null,
    pageSize = PULL_PAGE_SIZE,
}) => {
    const { objectType, store, mapper = null, cleanOrphans = false } = entity;

    if (!api || !clientUuid) {
        logger.warning(`pullEntityType(${objectType}) skipped - api: ${!!api}, clientUuid: ${clientUuid}`);
        return 0;
    }

    const table = db?.[store];
    if (!table) {
        logger.warning(`Table "${store}" not found in db - skipping ${objectType}`);
        return 0;
    }

    // For cleanOrphans mode, always do a full sync to get all server IDs
    const metaKey = `lastSyncAt_${objectType}`;
    const lastSync = cleanOrphans ? null : await readMeta(db, metaStore, metaKey);

    // Captured before the first request: fallback delta marker with overlap
    const startedAt = new Date().toISOString();

    const serverIds = new Set();
    let upserted = 0;
    let offset = 0;
    let serverTime = null;

    for (;;) {
        throwIfAborted(signal);

        const searchParams = {
            client_uuid: clientUuid,
            object_type: objectType,
            limit: pageSize,
            offset,
        };
        if (lastSync) {
            searchParams.last_sync_at = lastSync;
        }

        const { signal: timeoutSignal, cleanup } = createTimeoutSignal(signal);
        let data;
        try {
            data = await api.get("sync/pull", { searchParams, signal: timeoutSignal }).json();
        } finally {
            cleanup();
        }

        const updated = data.updated || [];
        const deleted = data.deleted || [];
        if (data.server_time) {
            serverTime = data.server_time;
        }

        for (const raw of updated) {
            throwIfAborted(signal);
            // Apply entity mapper if provided (field name transformations)
            const mapped = mapper ? mapper(raw) : raw;
            const id = mapped.id ?? mapped.rowid;
            if (id !== undefined && id !== null) {
                serverIds.add(id);
                await table.put({ ...mapped, id });
                upserted++;
            } else {
                logger.warning(`Skipping ${objectType} entity without id/rowid:`, raw);
            }
        }

        // Tombstones and exclusions are complete on the first page only
        if (offset === 0) {
            for (const item of deleted) {
                throwIfAborted(signal);
                if (item.id !== undefined && item.id !== null) {
                    await table.delete(item.id);
                }
            }
        }

        if (onProgress) onProgress({ step: store, current: upserted, total: upserted });

        if (!data.has_more) break;
        offset += pageSize;
    }

    // Clean orphans: delete local entries that don't exist on server
    if (cleanOrphans && serverIds.size > 0) {
        const localEntries = await table.toArray();
        let orphansDeleted = 0;
        for (const local of localEntries) {
            throwIfAborted(signal);
            if (!serverIds.has(local.id)) {
                await table.delete(local.id);
                orphansDeleted++;
            }
        }
        if (orphansDeleted > 0) {
            logger.info(`Deleted ${orphansDeleted} orphan ${objectType}(s)`);
        }
    }

    // Persist the delta marker ONLY after every page succeeded
    await writeMeta(db, metaStore, metaKey, serverTime || startedAt);

    return upserted;
};

/**
 * Synchronizes the documents (images, PDFs...) of one object type via the
 * SmartAuth batch metadata endpoint + ZIP bundle download.
 *
 * Generalization of offlinepropale's syncAllProductDocuments /
 * syncAllCategoryDocuments: the object type, the target store, the foreign
 * key column and the doctypes are configuration.
 *
 * Flow:
 * 1. GET object/documents/{objectType}/{doctypes}[/since/{unixTs}]
 * 2. compare with local rows (server_updated_at) to build the download list
 * 3. download via ZIP bundle (downloadBundle), falling back to individual
 *    downloads for oversized files and files without a share hash
 * 4. purge documents of unavailable objects (response.unavailable_ids)
 * 5. on full sync (no since marker), purge local rows unknown to the server
 * 6. persist response.server_time (unix seconds) as the next since marker,
 *    only when the whole pass succeeded
 *
 * Local rows shape: { local_id (auto), [fk]: object_id, server_id, type,
 * filename, relative_path, mime_type, blob, size, synced_at,
 * server_updated_at }.
 *
 * @param {Object} params
 * @param {Object} params.api - Authenticated ky instance
 * @param {Object} params.db - Dexie database of the consumer module
 * @param {string} params.metaStore - Name of the key/value meta store
 * @param {Object} params.document - { objectType, store, fk }
 * @param {string[]} params.doctypes - Resolved doctypes to sync (e.g. ["image", "pdf"])
 * @param {AbortSignal|null} params.signal - Abort signal
 * @param {Function|null} params.onProgress - (current, total) => void
 * @returns {Promise<Object>} { total, downloaded, deleted, errors, skipped? }
 */
export const syncDocumentType = async ({
    api,
    db,
    metaStore,
    document: docConfig,
    doctypes,
    signal = null,
    onProgress = null,
}) => {
    const { objectType, store, fk } = docConfig;

    const results = {
        total: 0,
        downloaded: 0,
        deleted: 0,
        errors: []
    };

    const table = db?.[store];
    if (!api || !table) {
        logger.warning(`syncDocumentType(${objectType}) skipped - api: ${!!api}, table "${store}": ${!!table}`);
        return results;
    }

    if (!doctypes || doctypes.length === 0) {
        logger.info(`Documents ${objectType} - no doctypes enabled, skipping`);
        return { ...results, skipped: true };
    }

    const metaKey = `lastDocumentsSyncAt_${objectType}`;

    /**
     * Store a document blob for the parent object, preserving local_id on update.
     */
    const storeDocument = async (doc, blob, localByKey) => {
        const key = `${doc.object_id}_${doc.id}`;
        const local = localByKey.get(key);

        await table.put({
            ...(local ? { local_id: local.local_id } : {}),
            [fk]: doc.object_id,
            server_id: doc.id,
            type: doc.type,
            filename: doc.filename,
            relative_path: doc.relative_path,
            mime_type: doc.mime_type,
            blob: blob,
            size: doc.size,
            synced_at: new Date().toISOString(),
            server_updated_at: doc.updated_at,
        });
    };

    try {
        // 1. Fetch document metadata (batch endpoint, path-only URL segments)
        const lastSync = toUnixTimestamp(await readMeta(db, metaStore, metaKey));

        let url = `object/documents/${objectType}/${doctypes.join(",")}`;
        if (lastSync > 0) {
            url += `/since/${lastSync}`;
        }

        throwIfAborted(signal);

        const response = await api.get(url, { signal }).json();

        const serverDocs = response.documents || [];
        const unavailableIds = response.unavailable_ids || [];
        const serverTime = response.server_time || Math.floor(Date.now() / 1000);

        // 2. Get all local documents for comparison
        const localDocs = await table.toArray() || [];
        const localByKey = new Map(
            localDocs.map((d) => [`${d[fk]}_${d.server_id}`, d])
        );

        // 3. Identify documents to download
        const toDownload = [];
        const serverDocKeys = new Set();

        for (const doc of serverDocs) {
            throwIfAborted(signal);

            const key = `${doc.object_id}_${doc.id}`;
            serverDocKeys.add(key);

            const local = localByKey.get(key);

            // Download if new or updated (compare unix timestamps, normalize old ISO values)
            if (!local || doc.updated_at > toUnixTimestamp(local.server_updated_at)) {
                toDownload.push(doc);
            }
        }

        results.total = toDownload.length;
        logger.info(`Documents ${objectType} - ${toDownload.length} to download (server: ${serverDocs.length}, unavailable: ${unavailableIds.length})`);

        // 4. Download new/updated documents via ZIP bundle
        if (toDownload.length > 0) {
            // Build share-to-doc mapping
            const docByShare = new Map();
            const docsWithoutShare = [];
            for (const doc of toDownload) {
                if (doc.share) {
                    docByShare.set(doc.share, doc);
                } else {
                    docsWithoutShare.push(doc);
                }
            }

            // Fetch via bundle (loop handles pagination via remaining shares)
            let sharesToFetch = [...docByShare.keys()];
            const oversizedDocs = [];

            while (sharesToFetch.length > 0) {
                throwIfAborted(signal);

                const { manifest, files } = await downloadBundle(api, sharesToFetch, { signal });

                // Store included files
                for (const [share, blob] of files) {
                    const doc = docByShare.get(share);
                    if (!doc) continue;

                    await storeDocument(doc, blob, localByKey);
                    results.downloaded++;
                    if (onProgress) onProgress(results.downloaded, results.total);
                }

                // Queue oversized for individual download
                for (const over of manifest.oversized || []) {
                    const doc = docByShare.get(over.share);
                    if (doc) oversizedDocs.push(doc);
                }

                // Record errors
                for (const err of manifest.errors || []) {
                    const doc = docByShare.get(err.share);
                    logger.error(`Documents ${objectType} - bundle error for ${doc?.filename || err.share}:`, err.error);
                    results.errors.push({
                        filename: doc?.filename || err.share,
                        error: err.error,
                    });
                }

                // Continue with remaining shares (pagination)
                sharesToFetch = manifest.remaining || [];
            }

            // Download oversized files and files without share individually
            const individualDocs = [...docsWithoutShare, ...oversizedDocs];
            for (const doc of individualDocs) {
                throwIfAborted(signal);

                try {
                    const downloadUrl = doc.share
                        ? `object/${objectType}/${doc.object_id}/document/binary?q=${encodeURIComponent(doc.share)}`
                        : `object/${objectType}/${doc.object_id}/document/${encodeURIComponent(doc.relative_path)}/binary`;
                    const blob = await api.get(downloadUrl, { signal }).blob();

                    await storeDocument(doc, blob, localByKey);
                    results.downloaded++;
                    if (onProgress) onProgress(results.downloaded, results.total);

                    // Delay between individual downloads to avoid rate limiting
                    await new Promise((r) => setTimeout(r, 200));
                } catch (err) {
                    if (err.name === "AbortError") throw err;
                    if (isForbiddenError(err)) {
                        logger.error(`403 Forbidden on document ${doc.filename} - stopping sync immediately`);
                        throw new ForbiddenSyncError();
                    }
                    logger.error(`Error downloading document ${doc.filename}:`, err);
                    results.errors.push({ filename: doc.filename, error: err.message });
                }
            }
        }

        // 5. Delete documents of unavailable objects (out of filter or deleted)
        if (unavailableIds.length > 0) {
            for (const objectId of unavailableIds) {
                throwIfAborted(signal);

                try {
                    const docsToDelete = await table
                        .where(fk)
                        .equals(objectId)
                        .toArray() || [];

                    for (const doc of docsToDelete) {
                        await table.delete(doc.local_id);
                        results.deleted++;
                    }
                } catch (cleanupErr) {
                    logger.error(`Error cleaning up documents for ${objectType} ${objectId}:`, cleanupErr);
                }
            }
        }

        // 6. On full sync, delete documents that no longer exist on server
        if (lastSync === 0) {
            for (const local of localDocs) {
                throwIfAborted(signal);

                const key = `${local[fk]}_${local.server_id}`;
                if (!serverDocKeys.has(key)) {
                    await table.delete(local.local_id);
                    results.deleted++;
                }
            }
        }

        // 7. Save sync timestamp for next incremental sync
        await writeMeta(db, metaStore, metaKey, serverTime);
        logger.info(`Documents ${objectType} sync complete - downloaded: ${results.downloaded}, deleted: ${results.deleted}`);

        return results;

    } catch (err) {
        if (err.name === "AbortError") throw err;
        // Propagate 403 errors to stop all sync
        if (err.name === "ForbiddenSyncError" || isForbiddenError(err)) {
            logger.error(`403 Forbidden on ${objectType} documents - stopping sync`);
            throw new ForbiddenSyncError();
        }
        logger.error(`Error syncing ${objectType} documents:`, err);
        results.errors.push({ error: err.message });
        return results;
    }
};

/**
 * Fills a Dexie store from a simple GET endpoint (dictionaries, config...).
 *
 * Feed config: { key, endpoint, store, mapper?, extract?, clearBefore? }
 * - extract(res): picks the payload from the response (default: res.data)
 * - array payload: each item is put() (through mapper when provided)
 * - single-object payload: stored as one row; default shape
 *   { key: <feed key>, ...payload } unless a mapper is provided
 * - clearBefore: clear() the store before inserting (full-replace feeds)
 *
 * @param {Object} params
 * @param {Object} params.api - Authenticated ky instance
 * @param {Object} params.db - Dexie database of the consumer module
 * @param {Object} params.feed - Feed configuration
 * @param {AbortSignal|null} params.signal - Abort signal
 * @returns {Promise<Object>} { count }
 */
export const syncDataFeed = async ({ api, db, feed, signal = null }) => {
    const { key, endpoint, store, mapper = null, extract = null, clearBefore = false } = feed;
    const feedKey = key || store;

    const table = db?.[store];
    if (!api || !table) {
        logger.warning(`syncDataFeed(${feedKey}) skipped - api: ${!!api}, table "${store}": ${!!table}`);
        return { count: 0 };
    }

    const { signal: timeoutSignal, cleanup } = createTimeoutSignal(signal);
    let data;
    try {
        data = await api.get(endpoint, { signal: timeoutSignal }).json();
    } finally {
        cleanup();
    }

    const payload = extract ? extract(data) : (data.data ?? null);

    if (clearBefore) {
        await table.clear();
    }

    if (Array.isArray(payload)) {
        let count = 0;
        for (const item of payload) {
            throwIfAborted(signal);
            await table.put(mapper ? mapper(item) : item);
            count++;
        }
        logger.info(`Data feed ${feedKey} - ${count} entries`);
        return { count };
    }

    if (payload !== null && payload !== undefined) {
        await table.put(mapper ? mapper(payload) : { key: feedKey, ...payload });
        logger.info(`Data feed ${feedKey} - single entry stored`);
        return { count: 1 };
    }

    logger.warning(`Data feed ${feedKey} - endpoint "${endpoint}" returned no payload`);
    return { count: 0 };
};

/**
 * React hook orchestrating the pull-only reference sync.
 *
 * @param {Object} options
 * @param {Object} options.db - Dexie instance of the consumer module
 * @param {string} options.appVersion - App version sent to sync/register
 * @param {Object[]} options.entities - [{ objectType, store, mapper?, cleanOrphans? }]
 * @param {Object[]} options.documents - [{ objectType, store, fk, doctypes, enabled? }]
 *   doctypes: string[] or (prefs) => string[] ; enabled: bool or (prefs) => bool
 * @param {Object[]} options.dataFeeds - [{ key, endpoint, store, mapper?, extract?, clearBefore? }]
 * @param {string} options.metaStore - Key/value store name (default: "syncMeta")
 * @param {Function|null} options.getSyncPreferences - async () => prefs object,
 *   passed to each document entry's enabled/doctypes resolvers
 * @param {Function|null} options.onProgress - (progress|null) => void mirror of syncProgress
 * @returns {Object} { isSyncing, syncProgress, lastSyncAt, error, isInitialized, syncNow, resetSync }
 */
export const useReferenceSync = ({
    db,
    appVersion = "1.0.0",
    entities = [],
    documents = [],
    dataFeeds = [],
    metaStore = "syncMeta",
    getSyncPreferences = null,
    onProgress = null,
} = {}) => {
    const { private: api } = useApi();
    const hasApi = !!api;

    // State
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(null);
    const [lastSyncAt, setLastSyncAt] = useState(null);
    const [error, setError] = useState(null);

    // Refs to track abort and prevent concurrent syncs
    const abortControllerRef = useRef(null);
    const isSyncingRef = useRef(false);
    const apiRef = useRef(null);
    const clientUuidRef = useRef(null);

    // Config through a ref: keeps syncNow/resetSync stable across renders
    // even when the consumer passes inline arrays/objects
    const configRef = useRef(null);
    configRef.current = { db, appVersion, entities, documents, dataFeeds, metaStore, getSyncPreferences };

    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;

    // Keep api ref updated (useApi returns new object each render)
    useEffect(() => {
        apiRef.current = api;
    }, [api]);

    const isInitialized = !!db;

    const reportProgress = useCallback((progress) => {
        setSyncProgress(progress);
        if (onProgressRef.current) {
            try {
                onProgressRef.current(progress);
            } catch (err) {
                logger.error("onProgress callback failed:", err);
            }
        }
    }, []);

    /**
     * Gets or creates the client UUID, persisted in the meta store
     */
    const getOrCreateClientUuid = useCallback(async () => {
        const { db: database, metaStore: meta } = configRef.current;
        if (!database) return null;

        if (clientUuidRef.current) return clientUuidRef.current;

        try {
            const existing = await readMeta(database, meta, "clientUuid");
            if (existing) {
                clientUuidRef.current = existing;
                return existing;
            }

            const uuid = crypto.randomUUID();
            await writeMeta(database, meta, "clientUuid", uuid);
            clientUuidRef.current = uuid;
            return uuid;
        } catch (err) {
            logger.error("Error with clientUuid:", err);
            return null;
        }
    }, []);

    /**
     * Registers this client with SmartAuth (idempotent) and returns the UUID.
     * sync_scope is derived from the configured entities.
     */
    const registerSyncClient = useCallback(async () => {
        if (!apiRef.current) {
            logger.warning("registerSyncClient skipped - no api available");
            return null;
        }

        const uuid = await getOrCreateClientUuid();
        if (!uuid) {
            logger.error("registerSyncClient failed - could not get clientUuid");
            return null;
        }

        const { appVersion: version, entities: entityList } = configRef.current;

        const { signal: timeoutSignal, cleanup } = createTimeoutSignal(null);
        try {
            await apiRef.current.post("sync/register", {
                json: {
                    client_uuid: uuid,
                    app_version: version,
                    sync_scope: entityList.map((e) => e.objectType),
                },
                signal: timeoutSignal
            }).json();

            return uuid;
        } catch (err) {
            logger.error("Error registering sync client:", err);
            return null;
        } finally {
            cleanup();
        }
    }, [getOrCreateClientUuid]);

    /**
     * Full pull orchestration: register -> entities -> documents -> dataFeeds.
     *
     * Per-step errors are recorded in the result and the sync continues,
     * EXCEPT 403 (ForbiddenSyncError) and abort which stop everything.
     */
    const syncNow = useCallback(async () => {
        const {
            db: database,
            entities: entityList,
            documents: documentList,
            dataFeeds: feedList,
            metaStore: meta,
            getSyncPreferences: getPrefs,
        } = configRef.current;

        if (!database || !apiRef.current) {
            throw new Error("Sync not ready");
        }

        if (isSyncingRef.current) {
            logger.warning("Sync already in progress");
            return null;
        }

        if (!navigator.onLine) {
            const offlineError = new Error("Cannot sync while offline");
            logger.warning("Cannot sync while offline");
            setError(offlineError);
            throw offlineError;
        }

        isSyncingRef.current = true;
        setIsSyncing(true);
        setError(null);
        reportProgress(null);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const signal = abortController.signal;

        try {
            // Always register client with server (idempotent operation)
            const uuid = await registerSyncClient();
            if (!uuid) {
                throw new Error("Failed to register sync client");
            }

            const results = {};

            // 1. Entities (paginated sync/pull)
            for (const entity of entityList) {
                throwIfAborted(signal);

                try {
                    reportProgress({ step: entity.store, current: 0, total: 0 });
                    const count = await pullEntityType({
                        api: apiRef.current,
                        db: database,
                        metaStore: meta,
                        entity,
                        clientUuid: uuid,
                        signal,
                        onProgress: reportProgress,
                    });
                    results[entity.store] = { success: true, count };
                } catch (err) {
                    if (err.name === "AbortError") throw err;
                    // Stop immediately on 403 to avoid firewall blacklisting
                    if (isForbiddenError(err)) {
                        logger.error(`403 Forbidden on ${entity.objectType} - stopping sync immediately`);
                        throw new ForbiddenSyncError();
                    }
                    logger.error(`Error pulling ${entity.objectType}:`, err);
                    results[entity.store] = { success: false, error: err.message };
                }
            }

            // 2. Documents (bundle download into blob stores)
            let prefs = {};
            if (documentList.length > 0 && getPrefs) {
                try {
                    prefs = (await getPrefs()) || {};
                } catch (err) {
                    logger.error("getSyncPreferences failed, using empty prefs:", err);
                    prefs = {};
                }
            }

            for (const document of documentList) {
                throwIfAborted(signal);

                const enabled = typeof document.enabled === "function"
                    ? document.enabled(prefs)
                    : (document.enabled ?? true);
                if (!enabled) {
                    logger.info(`Documents ${document.objectType} sync disabled by preferences`);
                    results[document.store] = { success: true, skipped: true };
                    continue;
                }

                const doctypes = typeof document.doctypes === "function"
                    ? document.doctypes(prefs)
                    : document.doctypes;

                try {
                    reportProgress({ step: document.store, current: 0, total: 0 });
                    const docResults = await syncDocumentType({
                        api: apiRef.current,
                        db: database,
                        metaStore: meta,
                        document,
                        doctypes,
                        signal,
                        onProgress: (current, total) => {
                            reportProgress({ step: document.store, current, total });
                        },
                    });
                    results[document.store] = {
                        success: docResults.errors.length === 0,
                        ...docResults,
                    };
                } catch (err) {
                    if (err.name === "AbortError") throw err;
                    if (err.name === "ForbiddenSyncError" || err.isForbidden || isForbiddenError(err)) {
                        logger.error(`403 Forbidden on ${document.objectType} documents - stopping sync`);
                        throw new ForbiddenSyncError();
                    }
                    logger.error(`Error syncing ${document.objectType} documents:`, err);
                    results[document.store] = { success: false, error: err.message };
                }
            }

            // 3. Data feeds (dictionaries, config blocks...)
            for (const feed of feedList) {
                throwIfAborted(signal);

                const feedKey = feed.key || feed.store;
                try {
                    reportProgress({ step: feedKey, current: 0, total: 0 });
                    const feedResults = await syncDataFeed({
                        api: apiRef.current,
                        db: database,
                        feed,
                        signal,
                    });
                    results[feedKey] = { success: true, ...feedResults };
                } catch (err) {
                    if (err.name === "AbortError") throw err;
                    if (isForbiddenError(err)) {
                        logger.error(`403 Forbidden on data feed ${feedKey} - stopping sync immediately`);
                        throw new ForbiddenSyncError();
                    }
                    logger.error(`Error syncing data feed ${feedKey}:`, err);
                    results[feedKey] = { success: false, error: err.message };
                }
            }

            const timestamp = new Date().toISOString();
            await writeMeta(database, meta, "lastSyncAt", timestamp);
            setLastSyncAt(new Date(timestamp));

            reportProgress(null);

            return { ...results, syncedAt: timestamp };
        } catch (err) {
            if (err.name !== "AbortError") {
                logger.error("Sync error:", err);
                setError(err);
            } else {
                logger.info("Sync aborted");
            }
            throw err;
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            abortControllerRef.current = null;
        }
    }, [registerSyncClient, reportProgress]);

    /**
     * Clears every configured store (entities + documents + dataFeeds +
     * metaStore) then performs a full resync
     */
    const resetSync = useCallback(async () => {
        const {
            db: database,
            entities: entityList,
            documents: documentList,
            dataFeeds: feedList,
            metaStore: meta,
        } = configRef.current;

        if (!database) {
            throw new Error("Sync not ready");
        }

        if (isSyncingRef.current && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        try {
            const stores = new Set([
                ...entityList.map((e) => e.store),
                ...documentList.map((d) => d.store),
                ...feedList.map((f) => f.store),
                meta,
            ]);

            await Promise.all(
                [...stores].map((store) => database[store]?.clear())
            );

            clientUuidRef.current = null;
            setLastSyncAt(null);
            setError(null);
            reportProgress(null);

            return await syncNow();
        } catch (err) {
            logger.error("Reset sync error:", err);
            setError(err);
            throw err;
        }
    }, [syncNow, reportProgress]);

    // Load initial state from the meta store
    useEffect(() => {
        if (!isInitialized) return undefined;

        let cancelled = false;
        const { db: database, metaStore: meta } = configRef.current;

        readMeta(database, meta, "lastSyncAt").then((ts) => {
            if (ts && !cancelled) {
                setLastSyncAt(new Date(ts));
            }
        });
        getOrCreateClientUuid();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, getOrCreateClientUuid]);

    return {
        isSyncing,
        syncProgress,
        lastSyncAt,
        error,
        isInitialized,
        hasApi,
        syncNow,
        resetSync,
    };
};

export default useReferenceSync;
