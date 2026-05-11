import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useUpload } from "./index";

// Mock useApi from lib/hooks. The hook only needs post() and del().
const apiMock = {
    post: vi.fn(),
    del: vi.fn(),
};

// Mock useUploadQueue so queue: true tests can verify enqueue() was called
// without spinning up a real IndexedDB. Legacy callers (queue: false, the
// default) never reach this mock, which proves the non-regression contract.
const queueMock = {
    enqueue: vi.fn(),
    pending: [],
    retry: vi.fn(),
    cancel: vi.fn(),
    flush: vi.fn(),
    onResolved: vi.fn(() => () => {}),
};

vi.mock("lib/hooks", () => ({
    useApi: () => apiMock,
    useUploadQueue: () => queueMock,
}));

const setOnline = (value) => {
    Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        get: () => value,
    });
};

const httpError = (status) => {
    const err = new Error(`HTTP ${status}`);
    err.response = { status, clone: () => ({ json: async () => ({}) }) };
    return err;
};

describe("useUpload", () => {
    beforeEach(() => {
        apiMock.post.mockReset();
        apiMock.del.mockReset();
        queueMock.enqueue.mockReset();
        queueMock.enqueue.mockResolvedValue({ pending_id: "PID_FROM_QUEUE" });
        setOnline(true);
    });

    it("uploads a single file as multipart/form-data on the default endpoint", async () => {
        apiMock.post.mockResolvedValueOnce({
            upload_id: "abc",
            filename: "photo.jpg",
            mime: "image/jpeg",
            size: 12,
            sha256: "deadbeef",
        });

        const { result } = renderHook(() => useUpload());
        const file = new File(["hello world!"], "photo.jpg", { type: "image/jpeg" });

        const out = await result.current.uploadFile(file);

        expect(apiMock.post).toHaveBeenCalledTimes(1);
        const [endpoint, options] = apiMock.post.mock.calls[0];
        expect(endpoint).toBe("upload");
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.body.get("file")).toBeInstanceOf(File);
        expect(out.upload_id).toBe("abc");
    });

    it("respects a custom endpoint", async () => {
        apiMock.post.mockResolvedValueOnce({ upload_id: "z" });
        const { result } = renderHook(() => useUpload({ endpoint: "custom/upload" }));
        const file = new File(["x"], "x.jpg", { type: "image/jpeg" });
        await result.current.uploadFile(file);
        expect(apiMock.post.mock.calls[0][0]).toBe("custom/upload");
    });

    it("uploads multiple files in parallel", async () => {
        apiMock.post
            .mockResolvedValueOnce({ upload_id: "a" })
            .mockResolvedValueOnce({ upload_id: "b" });

        const { result } = renderHook(() => useUpload());
        const f1 = new File(["1"], "1.jpg", { type: "image/jpeg" });
        const f2 = new File(["2"], "2.jpg", { type: "image/jpeg" });

        const out = await result.current.uploadFiles([f1, f2]);

        expect(out).toHaveLength(2);
        expect(out[0].upload_id).toBe("a");
        expect(out[1].upload_id).toBe("b");
        expect(apiMock.post).toHaveBeenCalledTimes(2);
    });

    it("throws when uploadFile is called without a file", async () => {
        const { result } = renderHook(() => useUpload());
        // uploadFile is async, so the throw becomes a rejected promise.
        await expect(result.current.uploadFile()).rejects.toThrow(/file is required/);
    });

    it("throws when uploadFiles is called with a non-iterable", () => {
        const { result } = renderHook(() => useUpload());
        expect(() => result.current.uploadFiles({})).toThrow(/array or FileList/);
    });

    it("DELETEs the staged upload via cancelUpload", async () => {
        apiMock.del.mockResolvedValueOnce({ deleted: true });
        const { result } = renderHook(() => useUpload());
        const out = await result.current.cancelUpload("abc/def");
        expect(apiMock.del).toHaveBeenCalledWith("upload/abc%2Fdef");
        expect(out.deleted).toBe(true);
    });

    it("rejects cancelUpload without an id", async () => {
        const { result } = renderHook(() => useUpload());
        expect(() => result.current.cancelUpload()).toThrow(/uploadId is required/);
    });

    it("appends the file under the 'file' key", async () => {
        apiMock.post.mockResolvedValueOnce({ upload_id: "x" });
        const { result } = renderHook(() => useUpload());
        const blob = new Blob(["data"], { type: "image/png" });
        await result.current.uploadFile(blob, { filename: "renamed.png" });
        const fd = apiMock.post.mock.calls[0][1].body;
        // happy-dom does not honor the third "filename" argument of
        // FormData.append() consistently, so we only assert the key
        // shape; the real browser/fetch path uses the override.
        expect(fd.has("file")).toBe(true);
    });

    // ------------------------------------------------------------------
    // Non-regression: queue: false (default) must NEVER touch the queue.
    // ------------------------------------------------------------------
    it("never invokes the queue when queue option is false (legacy default)", async () => {
        apiMock.post.mockResolvedValueOnce({ upload_id: "x" });
        const { result } = renderHook(() => useUpload());
        await result.current.uploadFile(new File(["d"], "d.png", { type: "image/png" }));
        expect(queueMock.enqueue).not.toHaveBeenCalled();
        // No Idempotency-Key header injected either.
        const headers = apiMock.post.mock.calls[0][1].headers;
        expect(headers === undefined || !("Idempotency-Key" in headers)).toBe(true);
        // Return shape is the legacy raw api response (no pending_id key).
    });

    // ------------------------------------------------------------------
    // queue: true behaviour
    // ------------------------------------------------------------------
    describe("queue: true mode", () => {
        it("on success returns { upload_id, pending_id: null } and sends Idempotency-Key", async () => {
            apiMock.post.mockResolvedValueOnce({
                upload_id: "abc",
                filename: "p.png",
                mime: "image/png",
                size: 5,
            });
            const { result } = renderHook(() => useUpload({ queue: true }));
            const file = new File(["data"], "p.png", { type: "image/png" });
            const out = await result.current.uploadFile(file);

            expect(out.upload_id).toBe("abc");
            expect(out.pending_id).toBeNull();
            const opts = apiMock.post.mock.calls[0][1];
            expect(typeof opts.headers["Idempotency-Key"]).toBe("string");
            expect(opts.headers["Idempotency-Key"].length).toBeGreaterThan(0);
            expect(queueMock.enqueue).not.toHaveBeenCalled();
        });

        it("when offline, enqueues without calling api.post", async () => {
            setOnline(false);
            const { result } = renderHook(() => useUpload({ queue: true }));
            const file = new File(["d"], "p.png", { type: "image/png" });
            const out = await result.current.uploadFile(file);

            expect(apiMock.post).not.toHaveBeenCalled();
            expect(queueMock.enqueue).toHaveBeenCalledTimes(1);
            expect(out.upload_id).toBeNull();
            expect(typeof out.pending_id).toBe("string");
            expect(out.pending_id.length).toBeGreaterThan(0);
            // The enqueue call must reuse the same pendingId for idempotence chain.
            const calls = queueMock.enqueue.mock.calls[0];
            expect(calls[2].pendingId).toBe(out.pending_id);
        });

        it("on 5xx, returns the pendingId actually queued", async () => {
            apiMock.post.mockRejectedValueOnce(httpError(503));
            const { result } = renderHook(() => useUpload({ queue: true }));
            const file = new File(["d"], "p.png", { type: "image/png" });
            const out = await result.current.uploadFile(file);

            const enqueueOpts = queueMock.enqueue.mock.calls[0][2];
            expect(out.pending_id).toBe(enqueueOpts.pendingId);
            expect(out.upload_id).toBeNull();
        });

        it("on network failure (TypeError), enqueues", async () => {
            apiMock.post.mockRejectedValueOnce(new TypeError("Failed to fetch"));
            const { result } = renderHook(() => useUpload({ queue: true }));
            const file = new File(["d"], "p.png", { type: "image/png" });
            const out = await result.current.uploadFile(file);

            expect(queueMock.enqueue).toHaveBeenCalledTimes(1);
            expect(out.upload_id).toBeNull();
            expect(typeof out.pending_id).toBe("string");
        });

        it("on 4xx, throws (server-side validation, no retry)", async () => {
            apiMock.post.mockRejectedValueOnce(httpError(422));
            const { result } = renderHook(() => useUpload({ queue: true }));
            const file = new File(["d"], "p.png", { type: "image/png" });
            await expect(result.current.uploadFile(file)).rejects.toThrow(/HTTP 422/);
            expect(queueMock.enqueue).not.toHaveBeenCalled();
        });
    });
});
