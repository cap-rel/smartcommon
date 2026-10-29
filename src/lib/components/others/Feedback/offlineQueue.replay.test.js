import { describe, it, expect, beforeEach, vi } from "vitest";

// capTests deduplicates a replayed report by the fingerprint of its type,
// title, body, reporter and screenshot BYTES (the context is not part of
// it). A resend with the same Idempotency-Key must therefore carry exactly
// the screenshot that was queued: re-encoding or reducing it again at send
// time would make capTests answer 422 idempotency_key_reused.
//
// Unlike offlineQueue.test.js, buildFormData is the real one here, so the
// multipart body actually posted is inspected.

// vi.mock factories are hoisted above the imports: their fakes must be too.
const { rows, store, convertImageForUpload } = vi.hoisted(() => {
    const rows = new Map();
    return {
        rows,
        // In-memory stand-in for the Dexie table (happy-dom has no IndexedDB).
        store: {
            put: vi.fn(async (row) => { rows.set(row.idempotency_key, row); }),
            delete: vi.fn(async (key) => { rows.delete(key); }),
            toArray: vi.fn(async () => [...rows.values()]),
            count: vi.fn(async () => rows.size),
        },
        // The image pipeline must never run at send time: a call here would
        // mean the queued screenshot is re-encoded before being resent.
        convertImageForUpload: vi.fn(async () => {
            throw new Error("the screenshot must not be re-encoded at send time");
        }),
    };
});

vi.mock("dexie", () => ({
    default: class Dexie {
        constructor() {
            this.version = () => ({ stores: () => {} });
            return new Proxy(this, {
                get: (target, prop) => (prop === "version" ? target.version : store),
            });
        }
    },
}));

vi.mock("lib/upload", () => ({ convertImageForUpload }));

import { enqueueReport, flushQueue, setQueueApiProvider } from "./offlineQueue";

const SCREENSHOT_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4, 250, 251, 252, 253]);

const bytesOf = async (blob) => new Uint8Array(await blob.arrayBuffer());

describe("offline feedback queue replay", () => {
    beforeEach(() => {
        rows.clear();
        vi.clearAllMocks();
    });

    it("sends the same screenshot bytes, text and key on every send of a queued entry", async () => {
        const screenshot = new File([SCREENSHOT_BYTES], "screenshot.png", { type: "image/png" });
        await enqueueReport({
            type: "bug",
            title: "Broken export",
            body: "The export button does nothing.",
            screenshot,
            consent: true,
            appVersion: "1.0.0",
            relayPath: "feedback/report",
            context: { occurred_at: "2026-10-29T08:00:00.000Z", log_excerpt: [], network_errors: [] },
        }, "key-replay");

        // First flush: the connection drops (no response), the row is kept.
        // Second flush: the relay accepts, the row is deleted.
        const post = vi.fn()
            .mockRejectedValueOnce(new TypeError("fetch failed"))
            .mockResolvedValueOnce({ ok: true, ref: "CSPN-7", tracking_url: "https://captests.example/t/CSPN-7" });
        setQueueApiProvider({ post });

        await flushQueue();
        expect(rows.has("key-replay")).toBe(true);
        await flushQueue();
        expect(rows.has("key-replay")).toBe(false);

        expect(post).toHaveBeenCalledTimes(2);
        const [first, second] = post.mock.calls.map(([, options]) => options);

        expect(first.headers["Idempotency-Key"]).toBe("key-replay");
        expect(second.headers["Idempotency-Key"]).toBe("key-replay");

        for (const field of ["type", "title", "body", "screenshot_consent"]) {
            expect(second.body.get(field)).toBe(first.body.get(field));
        }

        const firstBytes = await bytesOf(first.body.get("screenshot"));
        const secondBytes = await bytesOf(second.body.get("screenshot"));
        expect(firstBytes).toEqual(SCREENSHOT_BYTES);
        expect(secondBytes).toEqual(SCREENSHOT_BYTES);

        expect(convertImageForUpload).not.toHaveBeenCalled();
    });
});
