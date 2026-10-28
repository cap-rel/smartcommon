import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Dexie before importing the module under test.
const mockStore = {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
};

vi.mock("dexie", () => {
    return {
        default: class Dexie {
            constructor() {
                this.version = () => ({ stores: () => {} });
                return new Proxy(this, {
                    get: (target, prop) => {
                        if (prop === "version") return target.version;
                        return mockStore[prop] ?? mockStore;
                    },
                });
            }
        },
    };
});

// Mock feedbackPayload so sendQueuedReport doesn't need the real one.
// RETRYABLE_RELAY_STATUS must be mirrored: the flush reads it from here.
vi.mock("./feedbackPayload", () => ({
    buildFormData: vi.fn(() => new FormData()),
    RETRYABLE_RELAY_STATUS: [429, 502, 503],
}));

import { enqueueReport, flushQueue, setQueueApiProvider, countPending } from "./offlineQueue";
import { buildFormData } from "./feedbackPayload";

describe("offline feedback queue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStore.toArray.mockResolvedValue([]);
        mockStore.count.mockResolvedValue(0);
    });

    it("enqueues a report with its idempotency key and its submit-time context", async () => {
        const context = {
            channel: "pwa",
            occurred_at: "2020-01-01T00:00:00.000Z",
            log_excerpt: ["line"],
            network_errors: [],
        };
        const payload = {
            type: "bug",
            title: "Broken",
            body: "It does not work",
            screenshot: null,
            consent: false,
            appVersion: "1.0.0",
            relayPath: "feedback/report",
            context,
        };

        await enqueueReport(payload, "key-123");

        expect(mockStore.put).toHaveBeenCalledWith(expect.objectContaining({
            idempotency_key: "key-123",
            payload: expect.objectContaining({
                type: "bug",
                body: "It does not work",
                relayPath: "feedback/report",
                context,
            }),
        }));
    });

    it("flush sends queued reports and deletes them on success", async () => {
        const context = { channel: "pwa", occurred_at: "2020-01-01T00:00:00.000Z" };
        const row = {
            idempotency_key: "key-abc",
            payload: {
                type: "bug",
                title: null,
                body: "Test",
                consent: false,
                appVersion: "1.0.0",
                relayPath: "feedback/report",
                screenshot: null,
                context,
            },
            created_at: Date.now(),
        };
        mockStore.toArray.mockResolvedValue([row]);

        const postMock = vi.fn().mockResolvedValue({ ok: true, ref: "CSPN-1", tracking_url: "https://..." });
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        expect(postMock).toHaveBeenCalledWith("feedback/report", expect.objectContaining({
            headers: { "Idempotency-Key": "key-abc" },
        }));
        expect(mockStore.delete).toHaveBeenCalledWith("key-abc");
    });

    it("flush reuses the stored submit-time context, not a fresh one", async () => {
        const context = { channel: "pwa", occurred_at: "2020-01-01T00:00:00.000Z" };
        const row = {
            idempotency_key: "key-ctx",
            payload: {
                type: "bug",
                title: null,
                body: "Test",
                consent: false,
                appVersion: "1.0.0",
                relayPath: "feedback/report",
                screenshot: null,
                context,
            },
            created_at: Date.now(),
        };
        mockStore.toArray.mockResolvedValue([row]);

        const postMock = vi.fn().mockResolvedValue({ ok: true, ref: "CSPN-1" });
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        // The context stored at submit time is forwarded to buildFormData;
        // the flush must not recompute one describing the retry moment.
        expect(buildFormData).toHaveBeenCalledWith(expect.objectContaining({
            context,
        }));
    });

    it("flush keeps the report when the send fails (network still down)", async () => {
        const row = {
            idempotency_key: "key-keep",
            payload: {
                type: "bug",
                title: null,
                body: "Test",
                consent: false,
                appVersion: null,
                relayPath: "feedback/report",
                screenshot: null,
            },
            created_at: Date.now(),
        };
        mockStore.toArray.mockResolvedValue([row]);

        const postMock = vi.fn().mockRejectedValue(new Error("network down"));
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        expect(mockStore.delete).not.toHaveBeenCalled();
    });

    it("flush drops the report when the relay refuses it (4xx rejection)", async () => {
        const row = {
            idempotency_key: "key-drop",
            payload: {
                type: "bug",
                title: null,
                body: "Test",
                consent: false,
                appVersion: null,
                relayPath: "feedback/report",
                screenshot: null,
            },
            created_at: Date.now(),
        };
        mockStore.toArray.mockResolvedValue([row]);

        // Like the real api.post (ky throwHttpErrors): a non-2xx answer
        // REJECTS with the response attached, it does not resolve.
        const postMock = vi.fn().mockRejectedValue(
            Object.assign(new Error("Request failed with status code 413"), {
                name: "HTTPError",
                response: { status: 413 },
            })
        );
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        expect(mockStore.delete).toHaveBeenCalledWith("key-drop");
    });

    it("flush drops the report when a 2xx body refuses it", async () => {
        const row = {
            idempotency_key: "key-drop-2xx",
            payload: {
                type: "bug",
                title: null,
                body: "Test",
                consent: false,
                appVersion: null,
                relayPath: "feedback/report",
                screenshot: null,
            },
            created_at: Date.now(),
        };
        mockStore.toArray.mockResolvedValue([row]);

        const postMock = vi.fn().mockResolvedValue({ ok: false, error: "validation_failed", code: "validation_failed" });
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        expect(mockStore.delete).toHaveBeenCalledWith("key-drop-2xx");
    });

    it("flush keeps the report on a transient relay refusal (429)", async () => {
        const row = {
            idempotency_key: "key-429",
            payload: {
                type: "bug",
                title: null,
                body: "Test",
                consent: false,
                appVersion: null,
                relayPath: "feedback/report",
                screenshot: null,
            },
            created_at: Date.now(),
        };
        mockStore.toArray.mockResolvedValue([row]);

        const postMock = vi.fn().mockRejectedValue(
            Object.assign(new Error("Request failed with status code 429"), {
                name: "HTTPError",
                response: { status: 429 },
            })
        );
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        // Rate limited: the report stays queued for the next flush.
        expect(mockStore.delete).not.toHaveBeenCalled();
    });

    it("countPending returns the number of queued reports", async () => {
        mockStore.count.mockResolvedValue(3);
        const count = await countPending();
        expect(count).toBe(3);
    });
});
