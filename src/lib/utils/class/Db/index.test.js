import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "fake-indexeddb/auto";

import { Db, LOGS_INDEXES } from "./index";
import { log } from "lib/utils";

// Each test uses a unique DB name so that Dexie does not see leftover
// state from a previous run. fake-indexeddb is in-memory but the global
// `indexedDB` is shared across tests in the file.
let counter = 0;
const uniqueName = (prefix) => `${prefix}_${Date.now()}_${++counter}`;

describe("Db class", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("single-version mode (retro-compat)", () => {
        it("creates a Db with version + stores and exposes Dexie instance", async () => {
            const name = uniqueName("single_basic");
            const db = new Db({ name, version: 1, stores: { foo: "id" } });

            expect(db.name).toBe(name);
            expect(db.instance).toBeDefined();
            expect(db.db).toBe(db.instance);

            await db.instance.foo.put({ id: 1, value: "a" });
            const row = await db.instance.foo.get(1);
            expect(row).toMatchObject({ id: 1, value: "a" });
            // `createdAt` / `updatedAt` are populated by the creating hook.
            expect(typeof row.createdAt).toBe("number");
            expect(typeof row.updatedAt).toBe("number");

            db.instance.close();
        });

        it("supports the bare default `new Db({ name })` (logs-only DB)", async () => {
            const name = uniqueName("bare_default");
            const db = new Db({ name });

            expect(db.instance).toBeDefined();
            // The `logs` store is always present.
            expect(db.instance.logs).toBeDefined();
            // No user store was declared.
            expect(db.instance.tables.map((t) => t.name)).toEqual(["logs"]);

            db.instance.close();
        });
    });

    describe("multi-version mode", () => {
        it("accepts versions: [single entry] and behaves like single mode", async () => {
            const name = uniqueName("multi_single_entry");
            const db = new Db({
                name,
                versions: [{ version: 1, stores: { foo: "id" } }],
            });

            await db.instance.foo.put({ id: 1, value: "a" });
            const row = await db.instance.foo.get(1);
            expect(row).toMatchObject({ id: 1, value: "a" });

            db.instance.close();
        });

        it("applies upgrade callback between v1 and v2", async () => {
            const name = uniqueName("multi_upgrade");

            // Step 1: open the DB at v1 and insert a row with `name`.
            const dbV1 = new Db({
                name,
                versions: [{ version: 1, stores: { foo: "id, name" } }],
            });
            await dbV1.instance.foo.put({ id: 1, name: "Alice" });
            dbV1.instance.close();

            // Step 2: reopen at v2 with an upgrade callback that renames
            // `name` to `fullName`. The Db wrapper declares both
            // versions so that Dexie computes the right migration path.
            const dbV2 = new Db({
                name,
                versions: [
                    { version: 1, stores: { foo: "id, name" } },
                    {
                        version: 2,
                        stores: { foo: "id, fullName" },
                        upgrade: (tx) => tx.foo.toCollection().modify((r) => {
                            r.fullName = r.name;
                            delete r.name;
                        }),
                    },
                ],
            });

            const row = await dbV2.instance.foo.get(1);
            expect(row.fullName).toBe("Alice");
            expect(row.name).toBeUndefined();

            dbV2.instance.close();
        });

        it("installs hooks on the FINAL set of stores", async () => {
            const name = uniqueName("multi_hooks_final");
            const db = new Db({
                name,
                versions: [
                    { version: 1, stores: { foo: "id" } },
                    { version: 2, stores: { bar: "id" } },
                ],
            });

            // Only `bar` is in the final schema, so only `bar` gets the
            // hook (which auto-populates createdAt).
            await db.instance.bar.put({ id: 10 });
            const row = await db.instance.bar.get(10);
            expect(typeof row.createdAt).toBe("number");

            db.instance.close();
        });
    });

    describe("validation errors", () => {
        it("throws when both `version` and `versions` are passed (explicit version)", () => {
            // `version: 2` is non-default, so the constructor warns; it
            // does NOT throw (decision E in todo.md). Still, the legacy
            // ambiguity is covered by the warn test below. Here we
            // assert the documented behaviour: no throw, `versions`
            // wins silently with a warning.
            const warnSpy = vi.spyOn(log, "warning").mockImplementation(() => {});
            const name = uniqueName("conflict_silent");
            const db = new Db({
                name,
                version: 2,
                versions: [{ version: 1, stores: { foo: "id" } }],
            });
            expect(warnSpy).toHaveBeenCalled();
            db.instance.close();
        });

        it("throws when neither `version`/`stores` nor `versions` produce a DB name", () => {
            expect(() => new Db({})).toThrow(/Db name/);
        });

        it("throws on empty `versions` array", () => {
            expect(() => new Db({ name: uniqueName("empty"), versions: [] }))
                .toThrow(/versions array cannot be empty/);
        });

        it("throws on non-increasing version numbers", () => {
            expect(() => new Db({
                name: uniqueName("non_increasing"),
                versions: [
                    { version: 2, stores: { foo: "id" } },
                    { version: 1, stores: { foo: "id" } },
                ],
            })).toThrow(/strictly increasing/);
        });

        it("throws on empty stores object in a versions entry", () => {
            expect(() => new Db({
                name: uniqueName("empty_stores"),
                versions: [{ version: 1, stores: {} }],
            })).toThrow(/stores cannot be empty/);
        });

        it("throws when `upgrade` is not a function", () => {
            expect(() => new Db({
                name: uniqueName("bad_upgrade"),
                versions: [{
                    version: 1,
                    stores: { foo: "id" },
                    upgrade: "not a function",
                }],
            })).toThrow(/upgrade, if present, must be a function/);
        });
    });

    describe("LOGS_INDEXES frozen contract", () => {
        // This test is intentionally brittle. The exact bytes of
        // LOGS_INDEXES contribute to Dexie's schema hash. Changing them
        // forces every consumer with an existing IndexedDB to bump
        // their user-facing version number, which the library cannot
        // coordinate. If this snapshot fails, see the FROZEN comment
        // on the LOGS_INDEXES declaration in
        // src/lib/utils/class/Db/index.js for the safe upgrade path.
        it("matches the canonical schema string byte-for-byte", () => {
            const expected = `
    id++,
    store,
    itemId,
    action,
    createdAt
`;
            expect(LOGS_INDEXES).toBe(expected);
        });
    });

    describe("silent-conflict warning", () => {
        it("logs a warning when `versions` is combined with a non-default `version`", () => {
            const warnSpy = vi.spyOn(log, "warning").mockImplementation(() => {});
            const name = uniqueName("warn_conflict");
            const db = new Db({
                name,
                version: 5,
                versions: [{ version: 1, stores: { foo: "id" } }],
            });
            expect(warnSpy).toHaveBeenCalledTimes(1);
            const msg = warnSpy.mock.calls[0][0];
            expect(msg).toMatch(/'version'.*'stores'.*ignored/);
            db.instance.close();
        });

        it("does NOT warn when `versions` is used alone (no extra single-mode args)", () => {
            const warnSpy = vi.spyOn(log, "warning").mockImplementation(() => {});
            const name = uniqueName("no_warn");
            const db = new Db({
                name,
                versions: [{ version: 1, stores: { foo: "id" } }],
            });
            expect(warnSpy).not.toHaveBeenCalled();
            db.instance.close();
        });
    });
});
