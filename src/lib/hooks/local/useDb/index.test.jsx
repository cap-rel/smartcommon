import { describe, it, expect, vi, afterEach } from "vitest";
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { renderHook } from "@testing-library/react";

import { useDb } from "./index";

let counter = 0;
const uniqueName = (prefix) => `${prefix}_${Date.now()}_${++counter}`;

describe("useDb", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("saves a new updatedAt when a row is updated", async () => {
        const { result } = renderHook(() => useDb({ name: uniqueName("usedb_updated"), stores: { foo: "id" } }));
        const db = result.current;
        const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000_000_000);
        await db.foo.put({ id: 1, value: "a" });

        now.mockReturnValue(1_000_000_600_000);
        await db.foo.update(1, { value: "b" });

        const row = await db.foo.get(1);
        expect(row.createdAt).toBe(1_000_000_000);
        expect(row.updatedAt).toBe(1_000_000_600);
        db.close();
    });

    it("drops logs older than a week when the database is opened", async () => {
        const name = uniqueName("usedb_purge");
        const nowSec = Math.floor(Date.now() / 1000);

        // Same schema as the hook, filled with an old and a recent log.
        const seed = new Dexie(name);
        seed.version(1).stores({ foo: "id", logs: "id++, store, itemId, action, data, createdAt" });
        await seed.logs.bulkAdd([
            { store: "foo", itemId: 1, action: "create", createdAt: nowSec - 8 * 24 * 3600 },
            { store: "foo", itemId: 2, action: "create", createdAt: nowSec - 3600 },
        ]);
        seed.close();

        const { result } = renderHook(() => useDb({ name, stores: { foo: "id" } }));
        await vi.waitFor(async () => {
            expect((await result.current.logs.toArray()).map(l => l.itemId)).toEqual([2]);
        });
        result.current.close();
    });
});
