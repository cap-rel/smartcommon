// Offline queue for feedback reports. When the network is down at submit
// time, the report (fields + screenshot blob + idempotency key) is stored
// in IndexedDB and flushed automatically on the next 'online' event.
//
// The Idempotency-Key is preserved across retries so the relay never
// creates a duplicate, even after a page reload between submit and flush.

import Dexie from "dexie";

import { createLogger } from "lib/utils";

const log = createLogger("FeedbackQueue");

const DB_NAME = "smartcommon-feedback-queue";
const STORE = "pending_reports";

// Module-level singleton: the queue must be shared across every component
// that mounts a FeedbackModal in the same origin (same PWA shell).
const state = {
    db: null,
    dbInitPromise: null,
    onlineHandlerInstalled: false,
    flushInFlight: false,
    apiProvider: null, // set by FeedbackModal via setQueueApiProvider
};

const ensureDb = () => {
    if (state.db) return Promise.resolve(state.db);
    if (state.dbInitPromise) return state.dbInitPromise;
    state.dbInitPromise = (async () => {
        const db = new Dexie(DB_NAME);
        db.version(1).stores({
            [STORE]: "idempotency_key, created_at",
        });
        state.db = db;
        return db;
    })();
    return state.dbInitPromise;
};

// The api instance (from useApi) is injected by the first mounted
// FeedbackModal. The queue is a module singleton but the api is a hook
// value, so it must be set from a component.
export const setQueueApiProvider = (api) => {
    state.apiProvider = api;
};

// Store a report for later sending. `payload` is the plain object of
// fields (type, title, body, screenshot File, consent, appVersion,
// relayPath) plus the context captured at submit time; `idempotencyKey`
// is the UUID generated at submit time.
export const enqueueReport = async (payload, idempotencyKey) => {
    const db = await ensureDb();
    const row = {
        idempotency_key: idempotencyKey,
        payload: {
            type: payload.type,
            title: payload.title ?? null,
            body: payload.body,
            consent: payload.consent,
            appVersion: payload.appVersion ?? null,
            relayPath: payload.relayPath,
            screenshot: payload.screenshot ?? null,
            context: payload.context ?? null,
        },
        created_at: Date.now(),
    };
    await db[STORE].put(row);
    log.info("report queued for offline send", idempotencyKey);
    return row;
};

// Send one queued report. Rebuilds the FormData from the stored fields;
// the stored context (captured at submit time) is reused as-is so the
// report describes the moment of the problem, not the moment of the retry.
const sendQueuedReport = async (row) => {
    const api = state.apiProvider;
    if (!api?.post) {
        throw new Error("no api provider");
    }

    const { buildFormData } = await import("./feedbackPayload");
    const formData = buildFormData({
        type: row.payload.type,
        title: row.payload.title ?? undefined,
        body: row.payload.body,
        screenshot: row.payload.screenshot,
        consent: row.payload.consent,
        appVersion: row.payload.appVersion ?? undefined,
        context: row.payload.context ?? undefined,
    });

    const response = await api.post(row.payload.relayPath, {
        body: formData,
        headers: { "Idempotency-Key": row.idempotency_key },
    });

    return response;
};

// Flush all queued reports. Called on 'online' and after a successful
// online submit (in case earlier reports are still pending).
export const flushQueue = async () => {
    if (state.flushInFlight) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    state.flushInFlight = true;
    try {
        const db = await ensureDb();
        const rows = await db[STORE].toArray();
        // Imported lazily like buildFormData below: keeps the image pipeline
        // out of the static graph of this module.
        const { FLUSH_KEEP_STATUS } = await import("./feedbackPayload");

        for (const row of rows) {
            try {
                const response = await sendQueuedReport(row);
                if (response?.ok) {
                    await db[STORE].delete(row.idempotency_key);
                    log.info("queued report sent", row.idempotency_key, response.ref);
                } else {
                    // 2xx but the body refuses: drop the report, it will
                    // never succeed on retry with the same content.
                    log.error("queued report rejected", row.idempotency_key, response?.code);
                    await db[STORE].delete(row.idempotency_key);
                }
            } catch (err) {
                // api.post throws on any non-2xx, so a relay refusal arrives
                // here as an error carrying the response. A definitive
                // refusal (4xx) drops the row instead of resending it
                // forever; transient statuses (429/502/503), an expired
                // session (401) or a request timeout (408), and network
                // failures keep the row for the next flush.
                const status = err?.response?.status;
                if (typeof status === "number" && !FLUSH_KEEP_STATUS.includes(status)) {
                    log.error("queued report rejected, dropping", row.idempotency_key, status);
                    await db[STORE].delete(row.idempotency_key);
                } else {
                    log.error("queued report send failed, kept for retry", row.idempotency_key, err?.message);
                }
            }
        }
    } finally {
        state.flushInFlight = false;
    }
};

// Install the 'online' listener once. Safe to call multiple times.
export const installOnlineFlush = () => {
    if (state.onlineHandlerInstalled) return;
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;

    state.onlineHandlerInstalled = true;
    window.addEventListener("online", () => {
        log.info("online event, flushing feedback queue");
        flushQueue().catch(err => log.error("flush failed", err));
    });
};

// Count of pending reports (for UI badges if needed).
export const countPending = async () => {
    const db = await ensureDb();
    return db[STORE].count();
};
