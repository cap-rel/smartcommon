import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mocked api returned by useApi().private
const apiMock = {
    get: vi.fn(),
    post: vi.fn(),
};

vi.mock("lib/hooks", () => ({
    useApi: () => ({ private: apiMock }),
}));

const downloadBundleMock = vi.fn();

vi.mock("../utils/functions/zipBundle", () => ({
    downloadBundle: (...args) => downloadBundleMock(...args),
}));

import {
    useReferenceSync,
    ForbiddenSyncError,
    isForbiddenError,
    toUnixTimestamp,
    pullEntityType,
    syncDocumentType,
    syncDataFeed,
} from "./useReferenceSync";

// ---------------------------------------------------------------------------
// Fake Dexie-like tables (Map-backed, promise API)
// ---------------------------------------------------------------------------

const createTable = (keyPath = "id", { autoIncrement = false } = {}) => {
    const rows = new Map();
    let counter = 0;
    return {
        _rows: rows,
        get: vi.fn(async (key) => rows.get(key)),
        put: vi.fn(async (obj) => {
            let key = obj[keyPath];
            if ((key === undefined || key === null) && autoIncrement) {
                counter += 1;
                key = counter;
                obj = { ...obj, [keyPath]: key };
            }
            rows.set(key, obj);
            return key;
        }),
        delete: vi.fn(async (key) => {
            rows.delete(key);
        }),
        clear: vi.fn(async () => {
            rows.clear();
        }),
        toArray: vi.fn(async () => [...rows.values()]),
        where: vi.fn((field) => ({
            equals: (value) => ({
                toArray: async () => [...rows.values()].filter((r) => r[field] === value),
            }),
        })),
    };
};

const createDb = () => ({
    syncMeta: createTable("key"),
    products: createTable("id"),
    categories: createTable("id"),
    productDocuments: createTable("local_id", { autoIncrement: true }),
    paymentModes: createTable("id"),
});

const jsonResponse = (payload) => ({
    json: async () => payload,
    blob: async () => new Blob(["binary"]),
});

const blobResponse = (content = "blob-data") => ({
    json: async () => ({}),
    blob: async () => new Blob([content]),
});

const forbiddenError = () => {
    const err = new Error("Forbidden");
    err.response = { status: 403 };
    return err;
};

const seedMeta = async (db, key, value) => {
    await db.syncMeta.put({ key, value });
};

const readMetaValue = (db, key) => db.syncMeta._rows.get(key)?.value;

beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    downloadBundleMock.mockReset();
    apiMock.post.mockReturnValue(jsonResponse({ status: "registered" }));
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe("isForbiddenError", () => {
    it("detects 403 from response status, plain status and message", () => {
        expect(isForbiddenError({ response: { status: 403 } })).toBe(true);
        expect(isForbiddenError({ status: 403 })).toBe(true);
        expect(isForbiddenError({ message: "Request failed with 403" })).toBe(true);
        expect(isForbiddenError({ response: { status: 500 } })).toBe(false);
    });
});

describe("toUnixTimestamp", () => {
    it("passes numbers through, converts ISO strings, falls back to 0", () => {
        expect(toUnixTimestamp(1234)).toBe(1234);
        expect(toUnixTimestamp("2026-01-01T00:00:00.000Z")).toBe(1767225600);
        expect(toUnixTimestamp("not-a-date")).toBe(0);
        expect(toUnixTimestamp(null)).toBe(0);
        expect(toUnixTimestamp(undefined)).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// pullEntityType
// ---------------------------------------------------------------------------

describe("pullEntityType", () => {
    it("applies the mapper, writes to the store and processes tombstones", async () => {
        const db = createDb();
        await db.products.put({ id: 99, label: "to delete" });

        apiMock.get.mockReturnValue(jsonResponse({
            updated: [{ rowid: 1, fk_product_type: "1", label: "P1" }],
            deleted: [{ id: 99 }],
        }));

        const mapper = (p) => ({ ...p, id: p.id ?? p.rowid, type: Number(p.fk_product_type) });

        const count = await pullEntityType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            entity: { objectType: "product", store: "products", mapper },
            clientUuid: "uuid-1",
        });

        expect(count).toBe(1);
        expect(db.products._rows.get(1)).toMatchObject({ id: 1, type: 1, label: "P1" });
        expect(db.products._rows.has(99)).toBe(false);

        const [url, opts] = apiMock.get.mock.calls[0];
        expect(url).toBe("sync/pull");
        expect(opts.searchParams).toMatchObject({
            client_uuid: "uuid-1",
            object_type: "product",
            limit: 500,
            offset: 0,
        });
    });

    it("sends last_sync_at from the per-type meta key on delta pulls", async () => {
        const db = createDb();
        await seedMeta(db, "lastSyncAt_product", "2026-01-01T00:00:00.000Z");

        apiMock.get.mockReturnValue(jsonResponse({ updated: [], deleted: [] }));

        await pullEntityType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            entity: { objectType: "product", store: "products" },
            clientUuid: "uuid-1",
        });

        expect(apiMock.get.mock.calls[0][1].searchParams.last_sync_at)
            .toBe("2026-01-01T00:00:00.000Z");
    });

    it("paginates until has_more is falsy, applies deleted on first page only", async () => {
        const db = createDb();
        await db.products.put({ id: 98, label: "survives page 2 tombstone" });
        await db.products.put({ id: 99, label: "deleted by page 1 tombstone" });

        apiMock.get.mockImplementation((url, opts) => {
            if (opts.searchParams.offset === 0) {
                return jsonResponse({
                    updated: [{ id: 1 }, { id: 2 }],
                    deleted: [{ id: 99 }],
                    has_more: true,
                    server_time: "server-time-1",
                });
            }
            return jsonResponse({
                updated: [{ id: 3 }],
                deleted: [{ id: 98 }],
                has_more: false,
                server_time: "server-time-2",
            });
        });

        const count = await pullEntityType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            entity: { objectType: "product", store: "products" },
            clientUuid: "uuid-1",
        });

        expect(count).toBe(3);
        expect(apiMock.get).toHaveBeenCalledTimes(2);
        expect(apiMock.get.mock.calls[0][1].searchParams.offset).toBe(0);
        expect(apiMock.get.mock.calls[1][1].searchParams.offset).toBe(500);

        // Tombstone of page 1 applied, tombstone of page 2 ignored
        expect(db.products._rows.has(99)).toBe(false);
        expect(db.products._rows.has(98)).toBe(true);
        expect([1, 2, 3].every((id) => db.products._rows.has(id))).toBe(true);

        // Delta marker = server_time of the LAST page
        expect(readMetaValue(db, "lastSyncAt_product")).toBe("server-time-2");
    });

    it("does NOT save the delta marker when a later page fails", async () => {
        const db = createDb();

        apiMock.get.mockImplementation((url, opts) => {
            if (opts.searchParams.offset === 0) {
                return jsonResponse({
                    updated: [{ id: 1 }],
                    deleted: [],
                    has_more: true,
                    server_time: "server-time-1",
                });
            }
            return { json: async () => { throw new Error("network down"); } };
        });

        await expect(pullEntityType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            entity: { objectType: "product", store: "products" },
            clientUuid: "uuid-1",
        })).rejects.toThrow("network down");

        expect(readMetaValue(db, "lastSyncAt_product")).toBeUndefined();
    });

    it("cleanOrphans forces a full pull and deletes local rows unknown to the server", async () => {
        const db = createDb();
        await seedMeta(db, "lastSyncAt_category", "2026-01-01T00:00:00.000Z");
        await db.categories.put({ id: 1, label: "kept" });
        await db.categories.put({ id: 50, label: "orphan" });

        apiMock.get.mockReturnValue(jsonResponse({
            updated: [{ id: 1, label: "kept" }, { id: 2, label: "new" }],
            deleted: [],
        }));

        await pullEntityType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            entity: { objectType: "category", store: "categories", cleanOrphans: true },
            clientUuid: "uuid-1",
        });

        // Full pull: no last_sync_at param despite the stored meta
        expect(apiMock.get.mock.calls[0][1].searchParams.last_sync_at).toBeUndefined();
        expect(db.categories._rows.has(50)).toBe(false);
        expect(db.categories._rows.has(1)).toBe(true);
        expect(db.categories._rows.has(2)).toBe(true);
    });

    it("returns 0 and skips when the target table is missing", async () => {
        const db = createDb();

        const count = await pullEntityType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            entity: { objectType: "product", store: "doesNotExist" },
            clientUuid: "uuid-1",
        });

        expect(count).toBe(0);
        expect(apiMock.get).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// syncDocumentType
// ---------------------------------------------------------------------------

describe("syncDocumentType", () => {
    const productDocsConfig = {
        objectType: "product",
        store: "productDocuments",
        fk: "product_id",
    };

    it("downloads new documents via bundle, stores blobs with the fk and saves server_time", async () => {
        const db = createDb();

        apiMock.get.mockReturnValue(jsonResponse({
            documents: [
                { id: 11, object_id: 2, type: "image", filename: "a.jpg", relative_path: "produit/2/a.jpg", mime_type: "image/jpeg", size: 10, updated_at: 800, share: "share-a" },
            ],
            unavailable_ids: [],
            server_time: 1000,
        }));

        const blob = new Blob(["img"]);
        downloadBundleMock.mockResolvedValue({
            manifest: { included: [], oversized: [], errors: [], remaining: [] },
            files: new Map([["share-a", blob]]),
        });

        const results = await syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: ["image"],
        });

        expect(results.downloaded).toBe(1);
        expect(results.errors).toEqual([]);
        expect(apiMock.get.mock.calls[0][0]).toBe("object/documents/product/image");
        expect(downloadBundleMock).toHaveBeenCalledWith(apiMock, ["share-a"], expect.anything());

        const stored = [...db.productDocuments._rows.values()][0];
        expect(stored).toMatchObject({
            product_id: 2,
            server_id: 11,
            filename: "a.jpg",
            server_updated_at: 800,
        });
        expect(stored.blob).toBe(blob);

        expect(readMetaValue(db, "lastDocumentsSyncAt_product")).toBe(1000);
    });

    it("uses the /since/ segment on incremental sync, purges unavailable objects but keeps unlisted docs", async () => {
        const db = createDb();
        await seedMeta(db, "lastDocumentsSyncAt_product", 900);
        // Doc of a product that became unavailable (tosell=0 or deleted)
        await db.productDocuments.put({ product_id: 7, server_id: 70, server_updated_at: 100 });
        // Doc of an untouched product: absent from the delta response, must stay
        await db.productDocuments.put({ product_id: 9, server_id: 90, server_updated_at: 100 });

        apiMock.get.mockReturnValue(jsonResponse({
            documents: [],
            unavailable_ids: [7],
            server_time: 2000,
        }));

        const results = await syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: ["image", "pdf"],
        });

        expect(apiMock.get.mock.calls[0][0]).toBe("object/documents/product/image,pdf/since/900");
        expect(results.deleted).toBe(1);

        const remaining = [...db.productDocuments._rows.values()];
        expect(remaining).toHaveLength(1);
        expect(remaining[0].product_id).toBe(9);
        expect(readMetaValue(db, "lastDocumentsSyncAt_product")).toBe(2000);
    });

    it("purges local orphans on full sync and skips up-to-date documents", async () => {
        const db = createDb();
        // Up to date locally (server_updated_at >= server doc updated_at)
        await db.productDocuments.put({ product_id: 3, server_id: 22, server_updated_at: 500 });
        // Orphan: unknown to the server
        await db.productDocuments.put({ product_id: 9, server_id: 90, server_updated_at: 100 });

        apiMock.get.mockReturnValue(jsonResponse({
            documents: [
                { id: 22, object_id: 3, type: "image", filename: "b.jpg", updated_at: 400, share: "share-b" },
            ],
            unavailable_ids: [],
            server_time: 3000,
        }));

        const results = await syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: ["image"],
        });

        // Nothing to download, orphan purged, up-to-date doc kept
        expect(downloadBundleMock).not.toHaveBeenCalled();
        expect(results.downloaded).toBe(0);
        expect(results.deleted).toBe(1);

        const remaining = [...db.productDocuments._rows.values()];
        expect(remaining).toHaveLength(1);
        expect(remaining[0].server_id).toBe(22);
    });

    it("downloads documents without a share hash individually", async () => {
        const db = createDb();

        apiMock.get.mockImplementation((url) => {
            if (url === "object/documents/product/image") {
                return jsonResponse({
                    documents: [
                        { id: 33, object_id: 5, type: "image", filename: "c.jpg", relative_path: "produit/5/c.jpg", mime_type: "image/jpeg", size: 5, updated_at: 100 },
                    ],
                    unavailable_ids: [],
                    server_time: 4000,
                });
            }
            return blobResponse("individual-file");
        });

        const results = await syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: ["image"],
        });

        expect(results.downloaded).toBe(1);
        expect(downloadBundleMock).not.toHaveBeenCalled();
        expect(apiMock.get.mock.calls[1][0])
            .toBe(`object/product/5/document/${encodeURIComponent("produit/5/c.jpg")}/binary`);
        expect([...db.productDocuments._rows.values()][0]).toMatchObject({
            product_id: 5,
            server_id: 33,
        });
    });

    it("returns skipped when no doctypes are enabled", async () => {
        const db = createDb();

        const results = await syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: [],
        });

        expect(results.skipped).toBe(true);
        expect(apiMock.get).not.toHaveBeenCalled();
    });

    it("throws ForbiddenSyncError on 403", async () => {
        const db = createDb();
        apiMock.get.mockReturnValue({ json: async () => { throw forbiddenError(); } });

        await expect(syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: ["image"],
        })).rejects.toThrow(ForbiddenSyncError);
    });

    it("swallows non-403 errors into results.errors (sync continues)", async () => {
        const db = createDb();
        apiMock.get.mockReturnValue({ json: async () => { throw new Error("boom"); } });

        const results = await syncDocumentType({
            api: apiMock,
            db,
            metaStore: "syncMeta",
            document: productDocsConfig,
            doctypes: ["image"],
        });

        expect(results.errors).toEqual([{ error: "boom" }]);
        expect(readMetaValue(db, "lastDocumentsSyncAt_product")).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// syncDataFeed
// ---------------------------------------------------------------------------

describe("syncDataFeed", () => {
    it("fills the store from an array payload, with mapper and clearBefore", async () => {
        const db = createDb();
        await db.paymentModes.put({ id: 42, code: "OLD" });

        apiMock.get.mockReturnValue(jsonResponse({
            data: [{ id: 1, code: "CB" }, { id: 2, code: "CHQ" }],
        }));

        const { count } = await syncDataFeed({
            api: apiMock,
            db,
            feed: {
                key: "paymentModes",
                endpoint: "syncdata/payment-modes",
                store: "paymentModes",
                mapper: (m) => ({ ...m, mapped: true }),
                clearBefore: true,
            },
        });

        expect(count).toBe(2);
        expect(apiMock.get.mock.calls[0][0]).toBe("syncdata/payment-modes");
        expect(db.paymentModes._rows.has(42)).toBe(false);
        expect(db.paymentModes._rows.get(1)).toMatchObject({ code: "CB", mapped: true });
    });

    it("stores a single-object payload under the feed key", async () => {
        const db = createDb();
        db.companyInfo = createTable("key");

        apiMock.get.mockReturnValue(jsonResponse({
            data: { name: "ACME", address: "1 rue du Port" },
        }));

        const { count } = await syncDataFeed({
            api: apiMock,
            db,
            feed: { key: "companyInfo", endpoint: "syncdata/company-info", store: "companyInfo" },
        });

        expect(count).toBe(1);
        expect(db.companyInfo._rows.get("companyInfo")).toMatchObject({ name: "ACME" });
    });

    it("supports a custom extract for non-standard response shapes", async () => {
        const db = createDb();
        db.templates = createTable("id");

        apiMock.get.mockReturnValue(jsonResponse({
            templates: [{ id: 5, ref: "T5" }],
        }));

        const { count } = await syncDataFeed({
            api: apiMock,
            db,
            feed: {
                key: "templates",
                endpoint: "prepropal/templates",
                store: "templates",
                extract: (res) => res.templates,
            },
        });

        expect(count).toBe(1);
        expect(db.templates._rows.get(5)).toMatchObject({ ref: "T5" });
    });
});

// ---------------------------------------------------------------------------
// useReferenceSync hook (orchestration)
// ---------------------------------------------------------------------------

describe("useReferenceSync", () => {
    const buildConfig = (db, extra = {}) => ({
        db,
        appVersion: "9.9.9",
        entities: [
            { objectType: "product", store: "products" },
        ],
        documents: [
            { objectType: "product", store: "productDocuments", fk: "product_id", doctypes: ["image"] },
        ],
        dataFeeds: [
            { key: "paymentModes", endpoint: "syncdata/payment-modes", store: "paymentModes" },
        ],
        ...extra,
    });

    const mockHappyBackend = (callLog = []) => {
        apiMock.post.mockImplementation((url) => {
            callLog.push(url);
            return jsonResponse({ status: "registered" });
        });
        apiMock.get.mockImplementation((url) => {
            callLog.push(url);
            if (url === "sync/pull") {
                return jsonResponse({ updated: [{ id: 1, label: "P1" }], deleted: [] });
            }
            if (url === "object/documents/product/image") {
                return jsonResponse({ documents: [], unavailable_ids: [], server_time: 100 });
            }
            if (url === "syncdata/payment-modes") {
                return jsonResponse({ data: [{ id: 1, code: "CB" }] });
            }
            throw new Error(`Unexpected url: ${url}`);
        });
    };

    it("syncNow orchestrates register -> entities -> documents -> dataFeeds in order", async () => {
        const db = createDb();
        const callLog = [];
        mockHappyBackend(callLog);

        const { result } = renderHook(() => useReferenceSync(buildConfig(db)));

        let syncResults;
        await act(async () => {
            syncResults = await result.current.syncNow();
        });

        expect(callLog).toEqual([
            "sync/register",
            "sync/pull",
            "object/documents/product/image",
            "syncdata/payment-modes",
        ]);

        // Register payload carries app version + scope derived from entities
        expect(apiMock.post.mock.calls[0][1].json).toMatchObject({
            app_version: "9.9.9",
            sync_scope: ["product"],
        });
        expect(apiMock.post.mock.calls[0][1].json.client_uuid).toBeTruthy();

        expect(syncResults.products).toEqual({ success: true, count: 1 });
        expect(syncResults.productDocuments).toMatchObject({ success: true, downloaded: 0 });
        expect(syncResults.paymentModes).toEqual({ success: true, count: 1 });
        expect(syncResults.syncedAt).toBeTruthy();

        expect(db.products._rows.get(1)).toMatchObject({ label: "P1" });
        expect(readMetaValue(db, "lastSyncAt")).toBe(syncResults.syncedAt);
        expect(result.current.lastSyncAt).toBeInstanceOf(Date);
        expect(result.current.isSyncing).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("stops everything on 403 and exposes a ForbiddenSyncError", async () => {
        const db = createDb();
        apiMock.get.mockImplementation((url) => {
            if (url === "sync/pull") {
                return { json: async () => { throw forbiddenError(); } };
            }
            return jsonResponse({});
        });

        const { result } = renderHook(() => useReferenceSync(buildConfig(db)));

        let caught;
        await act(async () => {
            try {
                await result.current.syncNow();
            } catch (err) {
                caught = err;
            }
        });

        expect(caught).toBeInstanceOf(ForbiddenSyncError);
        expect(result.current.error).toBeInstanceOf(ForbiddenSyncError);
        // Documents and data feeds were never reached
        const urls = apiMock.get.mock.calls.map((c) => c[0]);
        expect(urls).not.toContain("object/documents/product/image");
        expect(urls).not.toContain("syncdata/payment-modes");
        expect(result.current.isSyncing).toBe(false);
    });

    it("records a non-403 entity failure and continues with the remaining steps", async () => {
        const db = createDb();
        apiMock.get.mockImplementation((url) => {
            if (url === "sync/pull") {
                return { json: async () => { throw new Error("timeout"); } };
            }
            if (url === "object/documents/product/image") {
                return jsonResponse({ documents: [], unavailable_ids: [], server_time: 100 });
            }
            if (url === "syncdata/payment-modes") {
                return jsonResponse({ data: [] });
            }
            throw new Error(`Unexpected url: ${url}`);
        });

        const { result } = renderHook(() => useReferenceSync(buildConfig(db)));

        let syncResults;
        await act(async () => {
            syncResults = await result.current.syncNow();
        });

        expect(syncResults.products).toEqual({ success: false, error: "timeout" });
        expect(syncResults.paymentModes).toEqual({ success: true, count: 0 });
        // Failed entity did not persist a delta marker: next sync retries the same window
        expect(readMetaValue(db, "lastSyncAt_product")).toBeUndefined();
    });

    it("skips a document entry disabled by preferences", async () => {
        const db = createDb();
        const callLog = [];
        mockHappyBackend(callLog);

        const config = buildConfig(db, {
            documents: [
                {
                    objectType: "product",
                    store: "productDocuments",
                    fk: "product_id",
                    doctypes: (prefs) => [prefs.syncImages && "image"].filter(Boolean),
                    enabled: (prefs) => prefs.syncProductDocuments,
                },
            ],
            getSyncPreferences: async () => ({ syncProductDocuments: false, syncImages: true }),
        });

        const { result } = renderHook(() => useReferenceSync(config));

        let syncResults;
        await act(async () => {
            syncResults = await result.current.syncNow();
        });

        expect(syncResults.productDocuments).toEqual({ success: true, skipped: true });
        expect(callLog).not.toContain("object/documents/product/image");
    });

    it("resetSync clears all configured stores and performs a full resync", async () => {
        const db = createDb();
        const callLog = [];
        mockHappyBackend(callLog);

        await seedMeta(db, "clientUuid", "old-uuid");
        await seedMeta(db, "lastSyncAt_product", "2026-01-01T00:00:00.000Z");
        await db.products.put({ id: 77, label: "stale" });
        await db.productDocuments.put({ product_id: 77, server_id: 7, blob: new Blob([]) });
        await db.paymentModes.put({ id: 8, code: "OLD" });

        const { result } = renderHook(() => useReferenceSync(buildConfig(db)));

        await act(async () => {
            await result.current.resetSync();
        });

        // Stale rows are gone, fresh pull repopulated the stores
        expect(db.products._rows.has(77)).toBe(false);
        expect(db.products._rows.has(1)).toBe(true);
        expect(db.productDocuments._rows.size).toBe(0);
        expect(db.paymentModes._rows.get(1)).toMatchObject({ code: "CB" });

        // Meta store was cleared: new client uuid registered
        const newUuid = readMetaValue(db, "clientUuid");
        expect(newUuid).toBeTruthy();
        expect(newUuid).not.toBe("old-uuid");
        expect(callLog).toContain("sync/register");
        expect(result.current.error).toBeNull();
    });

    it("restores lastSyncAt from the meta store on mount", async () => {
        const db = createDb();
        await seedMeta(db, "lastSyncAt", "2026-06-30T10:00:00.000Z");

        const { result } = renderHook(() => useReferenceSync(buildConfig(db)));

        await waitFor(() => {
            expect(result.current.lastSyncAt).toBeInstanceOf(Date);
        });
        expect(result.current.lastSyncAt.toISOString()).toBe("2026-06-30T10:00:00.000Z");
    });

    it("throws 'Sync not ready' when no db is provided", async () => {
        const { result } = renderHook(() => useReferenceSync({}));

        expect(result.current.isInitialized).toBe(false);
        await expect(result.current.syncNow()).rejects.toThrow("Sync not ready");
    });
});
