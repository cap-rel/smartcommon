import { useMemo } from "react";

import { useApi, useUploadQueue } from "lib/hooks";
import { createLogger } from "lib/utils";
import { UPLOAD_TIMEOUT } from "lib/upload/uploadErrors";

const log = createLogger("useUpload");

// Extra attempts of a legacy-mode upload when nothing came back from the
// server (network drop, timeout). A 4xx/5xx would answer the same: no retry.
const DEFAULT_UPLOAD_RETRIES = 1;

/**
 * useUpload
 *
 * Hook for binary file uploads to the smartauth /upload endpoint.
 *
 * The endpoint stages each file into a per-user directory and returns
 * an opaque upload_id that the calling business module then references
 * from its own JSON payload (e.g. PUT /intervention/{id} with a
 * cover_image_upload_id field). The module's PHP controller consumes
 * the staged file via SmartAuth\Api\UploadHelper::consumeUpload().
 *
 * Two modes, picked at hook level via the `queue` option:
 *
 * Default mode (queue: false):
 *   uploadFile(file) -> Promise<{ upload_id, filename, mime, size, sha256 }>
 *   Throws on any error. No IDB, no Idempotency-Key, no pending_id.
 *   When nothing came back (network drop, timeout) the upload is sent again
 *   `retries` times (default 1) before the error is thrown.
 *
 * Timeout (both modes): UPLOAD_TIMEOUT (120 s) instead of the 10 s ky
 * default, too short for a photo on a mobile uplink. Override per hook
 * (useUpload({ timeout })) or per call (uploadFile(file, { timeout })),
 * `timeout: false` disables it.
 *
 * Queue mode (queue: true, offline-first):
 *   uploadFile(file, options?) ->
 *       Promise<{ upload_id: string|null, pending_id: string|null, ... }>
 *     - online + success  -> { upload_id, pending_id: null, filename, mime, size, ... }
 *     - offline / network / 5xx -> { upload_id: null, pending_id, filename, mime, size }
 *       (the blob is persisted in IDB and uploaded later; subscribe via
 *        useUploadQueue().onResolved to reconcile pending_id -> upload_id)
 *     - 4xx -> throws (server-side validation error, no auto-retry)
 *   The Idempotency-Key header carries the same pending_id for every
 *   retry of the same blob (see ~/dev/smartauth API contract).
 *
 * Returned API:
 *   - uploadFile(file, options?)
 *   - uploadFiles(files, options?)
 *   - cancelUpload(uploadId)  (server-side staging removal; queue mode keeps
 *                              this exactly as in legacy mode)
 *
 * The endpoint path is "upload" by default but can be overridden via
 * defaultOptions.endpoint (e.g. when the host module re-exposes it).
 */
export const useUpload = (defaultOptions = {}) => {
    const api = useApi();
    const queueMode = defaultOptions.queue === true;
    // The queue hook installs the online-handler and captures the latest
    // api ref on the singleton. We mount it only when queueMode is on so
    // legacy callers don't pay the IDB cost. queueMode is a config knob
    // read from a stable option, so the hook order doesn't actually swap
    // between renders of a given component instance.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queue = queueMode ? useUploadQueue({ endpoint: defaultOptions.endpoint }) : null;

    return useMemo(() => {
        const endpoint = defaultOptions.endpoint ?? "upload";
        const timeoutOf = (options) => (
            "timeout" in options ? options.timeout
                : ("timeout" in defaultOptions ? defaultOptions.timeout : UPLOAD_TIMEOUT)
        );

        const uploadFileLegacy = async (file, options = {}) => {
            if (!file) {
                throw new Error("useUpload.uploadFile: file is required");
            }

            const filename = options.filename ?? file.name ?? "upload.bin";

            // Note: ky does not expose XHR upload progress events; on
            // modern browsers the fetch API does not stream upload
            // progress either. onProgress is accepted for forward
            // compatibility but currently ignored. Document this in
            // capdoc:UPLOAD_PWA.md.
            const {
                onProgress: _onProgress,
                retries = defaultOptions.retries ?? DEFAULT_UPLOAD_RETRIES,
                ...kyOptions
            } = options;
            const timeout = timeoutOf(options);

            for (let attempt = 0; ; attempt++) {
                const formData = new FormData();
                formData.append("file", file, filename);
                try {
                    return await api.post(endpoint, {
                        body: formData,
                        ...kyOptions,
                        timeout,
                    });
                } catch (err) {
                    if (err?.response || attempt >= retries) {
                        throw err;
                    }
                    log.warning("upload attempt failed, retrying", filename, err?.name, err?.message);
                }
            }
        };

        const uploadFileQueued = async (file, options = {}) => {
            if (!file) {
                throw new Error("useUpload.uploadFile: file is required");
            }

            const filename = options.filename ?? file.name ?? "upload.bin";
            const pendingId =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const mime = file.type || "application/octet-stream";
            const size = file.size;
            const meta = options.meta || {};

            const enqueueAndReturn = async (extra = {}) => {
                await queue.enqueue(file, { filename, ...meta }, { pendingId });
                return {
                    upload_id: null,
                    pending_id: pendingId,
                    filename,
                    mime,
                    size,
                    ...extra,
                };
            };

            if (typeof navigator !== "undefined" && navigator.onLine === false) {
                return enqueueAndReturn();
            }

            const formData = new FormData();
            formData.append("file", file, filename);

            const { onProgress: _onProgress, meta: _meta, retries: _retries, ...kyOptions } = options;
            const headers = {
                ...(kyOptions.headers || {}),
                "Idempotency-Key": pendingId,
            };

            try {
                const result = await api.post(endpoint, {
                    body: formData,
                    ...kyOptions,
                    timeout: timeoutOf(options),
                    headers,
                });
                return {
                    upload_id: result?.upload_id ?? null,
                    pending_id: null,
                    filename: result?.filename ?? filename,
                    mime: result?.mime ?? mime,
                    size: result?.size ?? size,
                    sha256: result?.sha256,
                };
            } catch (err) {
                const status = err?.response?.status ?? null;
                // 4xx is a server-side validation error: bubble up, the queue
                // would only retry endlessly with the same broken payload.
                if (status !== null && status >= 400 && status < 500 && status !== 409) {
                    throw err;
                }
                // 5xx, 409 (idempotency conflict from the server, hand off to
                // the queue's exponential backoff) and network errors all get
                // queued.
                return enqueueAndReturn();
            }
        };

        const uploadFile = queueMode ? uploadFileQueued : uploadFileLegacy;

        const uploadFiles = (files, options = {}) => {
            if (!Array.isArray(files) && !(files instanceof FileList)) {
                throw new Error("useUpload.uploadFiles: files must be an array or FileList");
            }
            const list = Array.from(files);
            return Promise.all(list.map(file => uploadFile(file, options)));
        };

        const cancelUpload = (uploadId) => {
            if (!uploadId) {
                throw new Error("useUpload.cancelUpload: uploadId is required");
            }
            return api.del(`${endpoint}/${encodeURIComponent(uploadId)}`);
        };

        return { uploadFile, uploadFiles, cancelUpload };
    }, [api, queue, queueMode, defaultOptions.endpoint, defaultOptions.timeout, defaultOptions.retries]);
};
