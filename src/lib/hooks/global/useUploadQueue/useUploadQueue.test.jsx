import "fake-indexeddb/auto";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useUploadQueue, __resetUploadQueueForTests } from "./index";

// Mock the api dependency. enqueue/flush eventually call api.post();
// each test arranges the resolved/rejected behaviour it needs.
const apiMock = { post: vi.fn(), del: vi.fn() };

vi.mock("lib/hooks", () => ({
    useApi: () => apiMock,
}));

// Mock getStorageEstimate so quota checks are deterministic. Each test that
// cares about quota tweaks this via .mockResolvedValueOnce.
const storageMock = vi.fn();

vi.mock("lib/utils", async () => {
    const actual = await vi.importActual("lib/utils");
    return {
        ...actual,
        getStorageEstimate: () => storageMock(),
    };
});

const setOnline = (value) => {
    Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        get: () => value,
    });
};

const dispatchOnline = () => {
    window.dispatchEvent(new Event("online"));
};

const makeBlob = (text = "hello", type = "image/png") => {
    const b = new Blob([text], { type });
    // happy-dom doesn't populate Blob.name; some code paths read it.
    Object.defineProperty(b, "name", { value: "test.png", configurable: true });
    return b;
};

// ky-style HTTPError stand-in. The hook reads err.response.status and
// optionally err.response.clone().json().
const httpError = (status, body = {}) => {
    const err = new Error(`HTTP ${status}`);
    err.response = {
        status,
        clone: () => ({ json: async () => body }),
    };
    return err;
};

const networkError = () => {
    const err = new TypeError("Failed to fetch");
    return err;
};

beforeEach(async () => {
    await __resetUploadQueueForTests();
    apiMock.post.mockReset();
    apiMock.del.mockReset();
    storageMock.mockReset();
    storageMock.mockResolvedValue({
        available: 1024 * 1024 * 1024,
        availableFormatted: "1 GB",
    });
    setOnline(true);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("useUploadQueue - enqueue contract", () => {
    it("returns a non-empty pending_id after awaiting IDB write", async () => {
        apiMock.post.mockResolvedValue({ upload_id: "u1" });
        const { result } = renderHook(() => useUploadQueue());

        const ret = await act(async () => result.current.enqueue(makeBlob(), { a: 1 }));

        expect(typeof ret.pending_id).toBe("string");
        expect(ret.pending_id.length).toBeGreaterThan(0);
    });

    it("persists the row in IndexedDB", async () => {
        apiMock.post.mockImplementation(() => new Promise(() => {})); // never settles
        const { result } = renderHook(() => useUploadQueue());

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob("payload"), { x: 1 });
            pid = r.pending_id;
        });

        // Open the same DB outside the hook to assert the row is there.
        const Dexie = (await import("dexie")).default;
        const db = new Dexie("smartcommon-uploads-queue");
        db.version(1).stores({ uploads_pending: "pending_id, status, lastErrorType, createdAt" });
        const row = await db.uploads_pending.get(pid);
        await db.close();
        expect(row).toBeTruthy();
        expect(row.pending_id).toBe(pid);
        expect(row.meta).toEqual({ x: 1 });
    });

    it("throws QuotaExceededError when free quota < 10 MB", async () => {
        storageMock.mockResolvedValueOnce({
            available: 5 * 1024 * 1024,
            availableFormatted: "5 MB",
        });
        const { result } = renderHook(() => useUploadQueue());
        let caught;
        await act(async () => {
            try {
                await result.current.enqueue(makeBlob());
            } catch (err) {
                caught = err;
            }
        });
        expect(caught).toBeDefined();
        expect(caught.name).toBe("QuotaExceededError");
    });

    it("throws TypeError when blob is not a Blob/File", async () => {
        const { result } = renderHook(() => useUploadQueue());
        let caught;
        await act(async () => {
            try {
                await result.current.enqueue("not a blob");
            } catch (err) {
                caught = err;
            }
        });
        expect(caught).toBeInstanceOf(TypeError);
    });
});

describe("useUploadQueue - online success path", () => {
    it("uploads immediately, fires onResolved with upload_id + meta, then purges the row", async () => {
        apiMock.post.mockResolvedValue({
            upload_id: "abc",
            filename: "test.png",
            mime: "image/png",
            size: 5,
        });
        const { result } = renderHook(() => useUploadQueue());
        const resolved = vi.fn();
        const unsub = result.current.onResolved(resolved);

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob(), { interventionId: 42 });
            pid = r.pending_id;
        });

        await waitFor(() => expect(resolved).toHaveBeenCalled());
        expect(resolved).toHaveBeenCalledWith({
            pending_id: pid,
            upload_id: "abc",
            meta: { interventionId: 42 },
        });

        // Row purged from IDB.
        const Dexie = (await import("dexie")).default;
        const db = new Dexie("smartcommon-uploads-queue");
        db.version(1).stores({ uploads_pending: "pending_id, status, lastErrorType, createdAt" });
        const row = await db.uploads_pending.get(pid);
        await db.close();
        expect(row).toBeUndefined();

        unsub();
    });

    it("sends an Idempotency-Key header equal to the pending_id", async () => {
        apiMock.post.mockResolvedValue({ upload_id: "x" });
        const { result } = renderHook(() => useUploadQueue());

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob());
            pid = r.pending_id;
        });

        await waitFor(() => expect(apiMock.post).toHaveBeenCalled());
        const [, opts] = apiMock.post.mock.calls[0];
        expect(opts.headers["Idempotency-Key"]).toBe(pid);
    });
});

describe("useUploadQueue - error paths", () => {
    it("marks 4xx as failed without auto-retry", async () => {
        apiMock.post.mockRejectedValue(httpError(400, { error: "bad_mime" }));
        const { result } = renderHook(() => useUploadQueue());

        await act(async () => {
            await result.current.enqueue(makeBlob());
        });

        await waitFor(() => {
            const row = result.current.pending[0];
            expect(row?.status).toBe("failed");
            expect(row?.lastErrorType).toBe("http_4xx");
        });
        // Single attempt, no retry scheduled.
        expect(apiMock.post).toHaveBeenCalledTimes(1);
    });

    it("treats 5xx as a transient failure (network-like)", async () => {
        apiMock.post.mockRejectedValue(httpError(500, { error: "boom" }));
        // backoff just slow enough that we have a window to observe
        // lastErrorType="http_5xx" before max_retries fires.
        const { result } = renderHook(() =>
            useUploadQueue({ maxRetries: 20, backoffBaseMs: 100, backoffCapMs: 200 })
        );

        await act(async () => {
            await result.current.enqueue(makeBlob());
        });

        await waitFor(() => {
            const row = result.current.pending[0];
            expect(row?.lastErrorType).toBe("http_5xx");
        }, { timeout: 500 });

        await waitFor(
            () => expect(apiMock.post.mock.calls.length).toBeGreaterThan(1),
            { timeout: 500 }
        );
    });

    it("handles 409 (idempotency in progress) without bumping attempts", async () => {
        apiMock.post
            .mockRejectedValueOnce(
                httpError(409, { error: "upload_in_progress", retry_after_ms: 20 })
            )
            .mockResolvedValueOnce({ upload_id: "ok" });

        const { result } = renderHook(() => useUploadQueue());
        const resolved = vi.fn();
        result.current.onResolved(resolved);

        await act(async () => {
            await result.current.enqueue(makeBlob());
        });

        await waitFor(() => expect(resolved).toHaveBeenCalled(), { timeout: 500 });
        expect(apiMock.post).toHaveBeenCalledTimes(2);
    });

    it("re-uses the same Idempotency-Key across retries", async () => {
        apiMock.post
            .mockRejectedValueOnce(httpError(500))
            .mockResolvedValueOnce({ upload_id: "ok" });
        const { result } = renderHook(() => useUploadQueue({ backoffBaseMs: 5, backoffCapMs: 10 }));

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob());
            pid = r.pending_id;
        });

        await waitFor(() => expect(apiMock.post).toHaveBeenCalledTimes(2), { timeout: 500 });

        const key1 = apiMock.post.mock.calls[0][1].headers["Idempotency-Key"];
        const key2 = apiMock.post.mock.calls[1][1].headers["Idempotency-Key"];
        expect(key1).toBe(pid);
        expect(key2).toBe(pid);
    });

    it("stops auto-retrying after maxRetries", async () => {
        apiMock.post.mockRejectedValue(networkError());
        const { result } = renderHook(() =>
            useUploadQueue({ maxRetries: 3, backoffBaseMs: 5, backoffCapMs: 10 })
        );

        await act(async () => {
            await result.current.enqueue(makeBlob());
        });

        await waitFor(() => {
            const row = result.current.pending[0];
            expect(row?.status).toBe("failed");
            expect(row?.lastErrorType).toBe("max_retries");
        }, { timeout: 1000 });

        expect(apiMock.post).toHaveBeenCalledTimes(3);
    });
});

describe("useUploadQueue - offline / online transition", () => {
    it("does NOT POST while offline, just writes IDB", async () => {
        setOnline(false);
        const { result } = renderHook(() => useUploadQueue());

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob());
            pid = r.pending_id;
        });

        // Give any rogue microtask a chance to fire.
        await new Promise(r => setTimeout(r, 20));
        expect(apiMock.post).not.toHaveBeenCalled();

        const row = result.current.pending.find(r => r.pending_id === pid);
        expect(row?.status).toBe("idle");
    });

    it("flushes when the browser fires 'online'", async () => {
        setOnline(false);
        apiMock.post.mockResolvedValue({ upload_id: "ok" });
        const { result } = renderHook(() => useUploadQueue());
        const resolved = vi.fn();
        result.current.onResolved(resolved);

        await act(async () => {
            await result.current.enqueue(makeBlob());
        });
        expect(apiMock.post).not.toHaveBeenCalled();

        setOnline(true);
        await act(async () => {
            dispatchOnline();
        });

        await waitFor(() => expect(resolved).toHaveBeenCalled());
    });

    it("resets attempts on transient failed rows when coming online, but leaves http_4xx alone", async () => {
        // First: a network-failing blob, three rejections to exhaust maxRetries.
        apiMock.post
            .mockRejectedValueOnce(networkError())
            .mockRejectedValueOnce(networkError())
            .mockRejectedValueOnce(networkError())
            // Then: a 4xx-failing blob.
            .mockRejectedValueOnce(httpError(400));

        const { result } = renderHook(() =>
            useUploadQueue({ maxRetries: 3, backoffBaseMs: 5, backoffCapMs: 10 })
        );

        let pidNet;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob("net"));
            pidNet = r.pending_id;
        });
        await waitFor(() => {
            const row = result.current.pending.find(r => r.pending_id === pidNet);
            expect(row?.status).toBe("failed");
            expect(row?.lastErrorType).toBe("max_retries");
        }, { timeout: 1000 });

        let pid4xx;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob("biz"));
            pid4xx = r.pending_id;
        });
        await waitFor(() => {
            const row = result.current.pending.find(r => r.pending_id === pid4xx);
            expect(row?.status).toBe("failed");
            expect(row?.lastErrorType).toBe("http_4xx");
        }, { timeout: 500 });

        // Now everything succeeds. Dispatch online -> pidNet must retry, pid4xx stays.
        apiMock.post.mockReset();
        apiMock.post.mockResolvedValue({ upload_id: "ok" });

        await act(async () => { dispatchOnline(); });

        await waitFor(() => {
            const net = result.current.pending.find(r => r.pending_id === pidNet);
            expect(net).toBeUndefined();
        }, { timeout: 1000 });

        const after = result.current.pending.find(r => r.pending_id === pid4xx);
        expect(after?.status).toBe("failed");
        expect(after?.lastErrorType).toBe("http_4xx");
    });
});

describe("useUploadQueue - cancel / retry", () => {
    it("cancel removes the row from IDB and from pending", async () => {
        apiMock.post.mockImplementation(() => new Promise(() => {})); // hang
        const { result } = renderHook(() => useUploadQueue());

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob());
            pid = r.pending_id;
        });

        await act(async () => {
            await result.current.cancel(pid);
        });

        expect(result.current.pending.find(r => r.pending_id === pid)).toBeUndefined();

        const Dexie = (await import("dexie")).default;
        const db = new Dexie("smartcommon-uploads-queue");
        db.version(1).stores({ uploads_pending: "pending_id, status, lastErrorType, createdAt" });
        const row = await db.uploads_pending.get(pid);
        await db.close();
        expect(row).toBeUndefined();
    });

    it("retry resets attempts and triggers an immediate POST", async () => {
        apiMock.post.mockRejectedValueOnce(httpError(400));
        const { result } = renderHook(() => useUploadQueue());

        let pid;
        await act(async () => {
            const r = await result.current.enqueue(makeBlob());
            pid = r.pending_id;
        });
        await waitFor(() => {
            const row = result.current.pending.find(r => r.pending_id === pid);
            expect(row?.status).toBe("failed");
        });

        apiMock.post.mockResolvedValueOnce({ upload_id: "fixed" });
        const resolved = vi.fn();
        result.current.onResolved(resolved);

        await act(async () => {
            await result.current.retry(pid);
        });

        await waitFor(() => expect(resolved).toHaveBeenCalled());
    });
});

describe("useUploadQueue - parallel enqueue", () => {
    it("uploads every blob concurrently and never drops one", async () => {
        apiMock.post.mockImplementation((_, opts) =>
            Promise.resolve({ upload_id: `srv-${opts.headers["Idempotency-Key"]}` })
        );
        const { result } = renderHook(() => useUploadQueue());
        const resolved = [];
        result.current.onResolved((e) => resolved.push(e));

        await act(async () => {
            await Promise.all([
                result.current.enqueue(makeBlob("1")),
                result.current.enqueue(makeBlob("2")),
                result.current.enqueue(makeBlob("3")),
            ]);
        });

        await waitFor(() => expect(resolved.length).toBe(3));
        const ids = new Set(resolved.map(r => r.upload_id));
        expect(ids.size).toBe(3);
    });
});
