import Dexie from "dexie";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { useApi } from "lib/hooks";
import { log, getStorageEstimate } from "lib/utils";

const DB_NAME = "smartcommon-uploads-queue";
const STORE = "uploads_pending";
const QUOTA_MIN_BYTES = 10 * 1024 * 1024;
const DEFAULT_409_RETRY_MS = 2000;

const initialSnapshot = Object.freeze([]);

// Module-level singleton state. Shared across every component that mounts
// useUploadQueue in the same origin, which is what the spec requires
// (queue must coalesce across modules running in the same PWA shell).
const state = {
    db: null,
    dbInitPromise: null,
    rows: new Map(),
    snapshot: initialSnapshot,
    listeners: new Set(),
    resolvedListeners: new Set(),
    pendingTimeouts: new Map(),
    inFlight: new Set(),
    currentApi: null,
    currentEndpoint: "upload",
    config: {
        maxRetries: 10,
        backoffBaseMs: 1000,
        backoffCapMs: 60000,
    },
    hydrated: false,
    hydratePromise: null,
    onlineHandlerInstalled: false,
};

const nowSec = () => Math.floor(Date.now() / 1000);

const isOnlineNow = () => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine !== false;
};

const ensureDb = () => {
    if (state.db) return Promise.resolve(state.db);
    if (state.dbInitPromise) return state.dbInitPromise;
    state.dbInitPromise = (async () => {
        const db = new Dexie(DB_NAME);
        db.version(1).stores({
            [STORE]: "pending_id, status, lastErrorType, createdAt",
        });
        state.db = db;
        return db;
    })();
    return state.dbInitPromise;
};

const buildSnapshot = () => {
    const arr = [];
    for (const row of state.rows.values()) {
        // Strip the blob from the React-facing snapshot: consumers don't
        // need it and serialising it through React state churn is wasteful.
        const { blob: _blob, ...rest } = row;
        arr.push(rest);
    }
    return Object.freeze(arr);
};

const emitChange = () => {
    state.snapshot = buildSnapshot();
    for (const l of state.listeners) {
        try { l(); }
        catch (err) { log.error("useUploadQueue: listener threw", err); }
    }
};

const persistRow = async (row) => {
    try {
        const db = await ensureDb();
        await db[STORE].put({ ...row });
    } catch (err) {
        log.error("useUploadQueue: persist failed", err);
    }
};

const deleteRow = async (pendingId) => {
    state.rows.delete(pendingId);
    state.inFlight.delete(pendingId);
    const t = state.pendingTimeouts.get(pendingId);
    if (t) {
        clearTimeout(t);
        state.pendingTimeouts.delete(pendingId);
    }
    try {
        const db = await ensureDb();
        await db[STORE].delete(pendingId);
    } catch (err) {
        log.error("useUploadQueue: delete failed", err);
    }
};

const checkQuota = async () => {
    const estimate = await getStorageEstimate();
    if (!estimate) return;
    if (typeof estimate.available === "number" && estimate.available < QUOTA_MIN_BYTES) {
        const err = new Error(
            `useUploadQueue: free quota too low (${estimate.availableFormatted} < 10 MB).`
        );
        err.name = "QuotaExceededError";
        throw err;
    }
};

const computeBackoffMs = (attempts) =>
    Math.min(
        state.config.backoffCapMs,
        state.config.backoffBaseMs * Math.pow(2, Math.max(0, attempts - 1))
    );

const scheduleRetry = (pendingId, delayMs) => {
    const prev = state.pendingTimeouts.get(pendingId);
    if (prev) clearTimeout(prev);
    const id = setTimeout(() => {
        state.pendingTimeouts.delete(pendingId);
        attemptUpload(pendingId).catch(() => {});
    }, delayMs);
    state.pendingTimeouts.set(pendingId, id);
};

const attemptUpload = async (pendingId) => {
    if (state.inFlight.has(pendingId)) return;
    const row = state.rows.get(pendingId);
    if (!row) return;
    if (row.status === "resolved") return;
    if (!state.currentApi) {
        // No mounted hook yet, retry once the hook captures the api.
        return;
    }
    if (!isOnlineNow()) return;

    state.inFlight.add(pendingId);
    row.status = "uploading";
    row.updatedAt = nowSec();
    await persistRow(row);
    emitChange();

    const formData = new FormData();
    formData.append("file", row.blob, row.filename);

    try {
        const result = await state.currentApi.post(state.currentEndpoint, {
            body: formData,
            headers: { "Idempotency-Key": row.pending_id },
            silent: true,
        });

        state.inFlight.delete(pendingId);
        row.status = "resolved";
        row.upload_id = result?.upload_id ?? null;
        row.lastError = null;
        row.lastErrorType = null;
        row.updatedAt = nowSec();
        await persistRow(row);

        // Notify subscribers BEFORE removal so they can capture upload_id.
        for (const cb of state.resolvedListeners) {
            try {
                cb({
                    pending_id: pendingId,
                    upload_id: row.upload_id,
                    meta: row.meta,
                });
            } catch (e) {
                log.error("useUploadQueue: onResolved listener threw", e);
            }
        }
        await deleteRow(pendingId);
        emitChange();
        return;
    } catch (err) {
        state.inFlight.delete(pendingId);
        const status = err?.response?.status ?? null;
        const apiMsg = err?.apiMessage || err?.message || "upload failed";

        if (status === 409) {
            // Idempotency in progress server-side. Do not bump attempts.
            let retryAfterMs = DEFAULT_409_RETRY_MS;
            try {
                const body = await err.response.clone().json();
                if (body && typeof body.retry_after_ms === "number") {
                    retryAfterMs = body.retry_after_ms;
                }
            } catch {
                // Body might not be JSON, keep default.
            }
            row.lastError = `409 ${apiMsg}`;
            row.status = "idle";
            row.updatedAt = nowSec();
            await persistRow(row);
            emitChange();
            scheduleRetry(pendingId, retryAfterMs);
            return;
        }

        let errorType;
        if (status === null) {
            errorType = "network";
        } else if (status >= 400 && status < 500) {
            errorType = "http_4xx";
        } else if (status >= 500) {
            errorType = "http_5xx";
        } else {
            errorType = "network";
        }

        row.attempts += 1;
        row.lastError = `${status ?? "NET"} ${apiMsg}`;
        row.lastErrorType = errorType;
        row.updatedAt = nowSec();

        if (errorType === "http_4xx") {
            row.status = "failed";
            log.error(`useUploadQueue: ${pendingId} 4xx (${status}), no auto-retry`, err);
            await persistRow(row);
            emitChange();
            return;
        }

        if (row.attempts >= state.config.maxRetries) {
            row.status = "failed";
            row.lastErrorType = "max_retries";
            log.error(`useUploadQueue: ${pendingId} max retries reached`, err);
            await persistRow(row);
            emitChange();
            return;
        }

        row.status = "idle";
        await persistRow(row);
        emitChange();
        scheduleRetry(pendingId, computeBackoffMs(row.attempts));
    }
};

const hydrate = () => {
    if (state.hydrated) return Promise.resolve();
    if (state.hydratePromise) return state.hydratePromise;
    state.hydratePromise = (async () => {
        try {
            const db = await ensureDb();
            // Pick up unfinished work...
            const records = await db[STORE]
                .where("status")
                .notEqual("resolved")
                .toArray();
            for (const rec of records) {
                const row = { ...rec };
                // A row persisted as "uploading" means the process died
                // mid-upload: no request is actually in flight anymore. Reset it
                // to "idle" so flush() retries it (flush only picks idle rows).
                if (row.status === "uploading") {
                    row.status = "idle";
                    row.updatedAt = nowSec();
                    await persistRow(row);
                }
                state.rows.set(rec.pending_id, row);
            }
            // ...and drop any orphan resolved rows (consumer crashed before
            // we could purge them; their listeners are gone, no use replaying).
            await db[STORE].where("status").equals("resolved").delete();
            state.hydrated = true;
            emitChange();
            if (isOnlineNow()) {
                flush().catch((err) =>
                    log.error("useUploadQueue: flush after hydrate failed", err)
                );
            }
        } catch (err) {
            log.error("useUploadQueue: hydration failed", err);
            state.hydrated = true;
        }
    })();
    return state.hydratePromise;
};

const installOnlineHandler = () => {
    if (typeof window === "undefined") return;
    if (state.onlineHandlerInstalled) return;
    state.onlineHandlerInstalled = true;
    window.addEventListener("online", () => {
        // Reset retry counter for transient failures so they get another
        // shot when the network comes back. 4xx stays failed (business error,
        // not a connectivity issue).
        let changed = false;
        for (const row of state.rows.values()) {
            if (
                row.status === "failed" &&
                (row.lastErrorType === "network" ||
                    row.lastErrorType === "http_5xx" ||
                    row.lastErrorType === "max_retries")
            ) {
                row.attempts = 0;
                row.status = "idle";
                row.lastError = null;
                row.lastErrorType = null;
                row.updatedAt = nowSec();
                persistRow(row);
                changed = true;
            }
        }
        if (changed) emitChange();
        flush().catch((err) =>
            log.error("useUploadQueue: flush on online failed", err)
        );
    });
};

const enqueue = async (blob, meta = {}, options = {}) => {
    if (!(blob instanceof Blob)) {
        throw new TypeError(
            "useUploadQueue.enqueue: blob must be a Blob or File"
        );
    }
    await checkQuota();

    const pendingId = options.pendingId || crypto.randomUUID();
    const filename = blob.name || meta?.filename || "upload.bin";
    const mime = blob.type || "application/octet-stream";
    const ts = nowSec();
    const row = {
        pending_id: pendingId,
        blob,
        filename,
        mime,
        size: blob.size,
        status: "idle",
        attempts: 0,
        lastError: null,
        lastErrorType: null,
        upload_id: null,
        meta: meta || {},
        createdAt: ts,
        updatedAt: ts,
    };
    state.rows.set(pendingId, row);

    const db = await ensureDb();
    await db[STORE].put({ ...row });
    emitChange();

    if (isOnlineNow() && state.currentApi) {
        Promise.resolve().then(() =>
            attemptUpload(pendingId).catch((err) =>
                log.error("useUploadQueue: initial attempt failed", err)
            )
        );
    }

    return { pending_id: pendingId };
};

const flush = async () => {
    if (!isOnlineNow()) return;
    if (!state.hydrated) await hydrate();
    const candidates = [];
    for (const row of state.rows.values()) {
        if (row.status === "idle") {
            candidates.push(row.pending_id);
        }
    }
    await Promise.all(
        candidates.map((id) => attemptUpload(id).catch(() => {}))
    );
};

const retry = async (pendingId) => {
    const row = state.rows.get(pendingId);
    if (!row) return;
    row.attempts = 0;
    row.lastError = null;
    row.lastErrorType = null;
    row.status = "idle";
    row.updatedAt = nowSec();
    await persistRow(row);
    emitChange();
    await attemptUpload(pendingId);
};

const cancel = async (pendingId) => {
    await deleteRow(pendingId);
    emitChange();
};

const onResolved = (cb) => {
    state.resolvedListeners.add(cb);
    return () => {
        state.resolvedListeners.delete(cb);
    };
};

const subscribe = (cb) => {
    state.listeners.add(cb);
    return () => {
        state.listeners.delete(cb);
    };
};

const getSnapshot = () => state.snapshot;

/**
 * Internal: reset the singleton state. Exported for tests only. Do NOT call
 * from application code; the queue is a process-wide singleton by design.
 *
 * We keep the Dexie connection and the window 'online' listener alive
 * across tests: dropping them tends to hang when an earlier test left a
 * pending transaction or a microtask that still references the old db.
 * Clearing the store and resetting in-memory state is enough for isolation.
 */
export const __resetUploadQueueForTests = async () => {
    for (const t of state.pendingTimeouts.values()) clearTimeout(t);
    state.pendingTimeouts.clear();
    state.inFlight.clear();
    state.rows.clear();
    state.listeners.clear();
    state.resolvedListeners.clear();
    state.snapshot = initialSnapshot;
    state.currentApi = null;
    state.currentEndpoint = "upload";
    state.config = { maxRetries: 10, backoffBaseMs: 1000, backoffCapMs: 60000 };
    state.hydrated = false;
    state.hydratePromise = null;
    if (state.db) {
        try { await state.db[STORE].clear(); } catch { /* ignore */ }
    }
};

/**
 * useUploadQueue
 *
 * Offline-first upload queue. Each blob is persisted in IndexedDB before
 * the hook returns its pending_id, then uploaded in the background with
 * exponential backoff. The queue auto-flushes on network reconnection
 * and emits onResolved({ pending_id, upload_id, meta }) once the server
 * acknowledges each upload.
 *
 * The queue is a process-wide singleton (module-level state). The hook is
 * a thin React shell over it: useSyncExternalStore for the pending list,
 * a useEffect for one-shot hydration and the online-event handler.
 *
 * Options (last-mounter wins, since the queue is singleton):
 *   endpoint        path POSTed to via useApi().post() (default "upload")
 *   maxRetries      hard cap on auto-retry attempts (default 10)
 *   backoffBaseMs   base for exp backoff: 1s, 2s, 4s, ... (default 1000)
 *   backoffCapMs    upper bound on backoff per attempt (default 60000)
 *
 * Return:
 *   enqueue(blob, meta?) -> Promise<{ pending_id }>  (awaits IDB write)
 *   pending: Array<PendingUpload>                    (snapshot, blob stripped)
 *   retry(pending_id)   -> Promise<void>
 *   cancel(pending_id)  -> Promise<void>
 *   flush()             -> Promise<void>
 *   onResolved(cb)      -> unsubscribe()
 */
export const useUploadQueue = (options = {}) => {
    const api = useApi();

    // Capture the api + options into the singleton in effects, NOT during the
    // render body: mutating module state while rendering is impure and would
    // clobber other consumers mid-render. Last-mounter-wins is intentional (the
    // queue is a process-wide singleton); effect ordering preserves it. We do
    // NOT clear currentApi on unmount -- another consumer may still be mounted,
    // and a stale-but-valid api beats a null one for the background retry loop.
    useEffect(() => {
        state.currentApi = api;
    }, [api]);

    useEffect(() => {
        if (options.endpoint) state.currentEndpoint = options.endpoint;
        if (options.maxRetries != null) state.config.maxRetries = options.maxRetries;
        if (options.backoffBaseMs != null) state.config.backoffBaseMs = options.backoffBaseMs;
        if (options.backoffCapMs != null) state.config.backoffCapMs = options.backoffCapMs;
    }, [options.endpoint, options.maxRetries, options.backoffBaseMs, options.backoffCapMs]);

    useEffect(() => {
        installOnlineHandler();
        hydrate().catch(() => {});
    }, []);

    const pending = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return useMemo(
        () => ({
            enqueue,
            pending,
            retry,
            cancel,
            flush,
            onResolved,
        }),
        [pending]
    );
};
