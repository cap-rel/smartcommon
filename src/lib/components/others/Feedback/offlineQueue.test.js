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
vi.mock("./feedbackPayload", () => ({
    buildFormData: vi.fn(() => new FormData()),
}));

import { enqueueReport, flushQueue, setQueueApiProvider, countPending } from "./offlineQueue";

describe("offline feedback queue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStore.toArray.mockResolvedValue([]);
        mockStore.count.mockResolvedValue(0);
    });

    it("enqueues a report with its idempotency key", async () => {
        const payload = {
            type: "bug",
            title: "Broken",
            body: "It does not work",
            screenshot: null,
            consent: false,
            appVersion: "1.0.0",
            relayPath: "feedback/report",
        };

        await enqueueReport(payload, "key-123");

        expect(mockStore.put).toHaveBeenCalledWith(expect.objectContaining({
            idempotency_key: "key-123",
            payload: expect.objectContaining({
                type: "bug",
                body: "It does not work",
                relayPath: "feedback/report",
            }),
        }));
    });

    it("flush sends queued reports and deletes them on success", async () => {
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

    it("flush drops the report when the relay refuses it (4xx)", async () => {
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

        const postMock = vi.fn().mockResolvedValue({ ok: false, error: "validation_failed", code: "validation_failed" });
        setQueueApiProvider({ post: postMock });

        await flushQueue();

        expect(mockStore.delete).toHaveBeenCalledWith("key-drop");
    });

    it("countPending returns the number of queued reports", async () => {
        mockStore.count.mockResolvedValue(3);
        const count = await countPending();
        expect(count).toBe(3);
    });
});
