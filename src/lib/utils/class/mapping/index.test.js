import { describe, expect, it } from "vitest";

import { Mapping } from "./index";

// ---------------------------------------------------------------------------
// REGRESSION: legacy behaviour must stay byte-identical. These schemas use
// only the historical options (key / from / to / schema / strict). If any of
// these break, the extension is not backward compatible.
// ---------------------------------------------------------------------------
describe("Mapping - legacy behaviour (regression)", () => {
    it("returns non-object input untouched", () => {
        const m = new Mapping({ schema: { a: { key: "b" } } });
        expect(m.map(null)).toBe(null);
        expect(m.map(42)).toBe(42);
        expect(m.reverse(undefined)).toBe(undefined);
        expect(m.map([1, 2])).toEqual([1, 2]);
    });

    it("renames keys both ways", () => {
        const m = new Mapping({ schema: { note_public: { key: "notePublic" } } });
        expect(m.map({ note_public: "hi" })).toEqual({ notePublic: "hi" });
        expect(m.reverse({ notePublic: "hi" })).toEqual({ note_public: "hi" });
    });

    it("applies `from` as a function and as a constant", () => {
        const fn = new Mapping({ schema: { n: { key: "n", from: (v) => Number(v) } } });
        expect(fn.map({ n: "7" })).toEqual({ n: 7 });

        const constant = new Mapping({ schema: { n: { key: "n", from: 42 } } });
        expect(constant.map({ n: 1 })).toEqual({ n: 42 });
    });

    it("applies `to` on reverse", () => {
        const m = new Mapping({ schema: { n: { key: "n", to: (v) => String(v) } } });
        expect(m.reverse({ n: 7 })).toEqual({ n: "7" });
    });

    it("maps nested objects via `schema`", () => {
        const m = new Mapping({ schema: { customer: { key: "client", schema: { zip: { key: "postalCode" } } } } });
        expect(m.map({ customer: { zip: "75001" } })).toEqual({ client: { postalCode: "75001" } });
        expect(m.reverse({ client: { postalCode: "75001" } })).toEqual({ customer: { zip: "75001" } });
    });

    it("honours strict: drops unknown keys, otherwise passes them through", () => {
        const strict = new Mapping({ schema: { a: { key: "a" } }, strict: true });
        expect(strict.map({ a: 1, extra: 2 })).toEqual({ a: 1 });

        const loose = new Mapping({ schema: { a: { key: "a" } } });
        expect(loose.map({ a: 1, extra: 2 })).toEqual({ a: 1, extra: 2 });
    });
});

// ---------------------------------------------------------------------------
// NEW: additive options.
// ---------------------------------------------------------------------------
describe("Mapping - type coercion", () => {
    it("coerces int/float/string/bool both ways", () => {
        const m = new Mapping({ schema: {
            n: { key: "n", type: "int" },
            f: { key: "f", type: "float" },
            s: { key: "s", type: "string" },
            b: { key: "b", type: "bool" },
        } });
        expect(m.map({ n: "5", f: "1.5", s: 9, b: 1 })).toEqual({ n: 5, f: 1.5, s: "9", b: true });
        expect(m.reverse({ n: "5", f: "1.5", s: 9, b: 0 })).toEqual({ n: 5, f: 1.5, s: "9", b: false });
    });

    it("falls back to default on invalid number / null string", () => {
        const m = new Mapping({ schema: {
            n: { key: "n", type: "int", default: 1 },
            s: { key: "s", type: "string", default: "x" },
        } });
        expect(m.map({ n: "abc", s: null })).toEqual({ n: 1, s: "x" });
    });
});

describe("Mapping - default (complete shape)", () => {
    it("emits the field with its default when the source key is absent", () => {
        const m = new Mapping({ schema: {
            name: { key: "name", type: "string", default: "" },
            status: { key: "status", type: "int", default: 1 },
        } });
        expect(m.map({})).toEqual({ name: "", status: 1 });
        expect(m.map({ status: 5 })).toEqual({ name: "", status: 5 });
    });

    it("does NOT invent keys when there is no default (legacy shape)", () => {
        const m = new Mapping({ schema: { name: { key: "name" } } });
        expect(m.map({})).toEqual({});
    });
});

describe("Mapping - aliases (multi-source read)", () => {
    it("reads from an alias when the primary key is absent", () => {
        const m = new Mapping({ schema: {
            id: { key: "id", type: "int", aliases: ["rowid"] },
        }, strict: true });
        expect(m.map({ id: 7 })).toEqual({ id: 7 });
        expect(m.map({ rowid: 9 })).toEqual({ id: 9 });
        expect(m.map({ id: 7, rowid: 9 })).toEqual({ id: 7 }); // primary wins
    });
});

describe("Mapping - readOnly (asymmetry)", () => {
    it("includes read-only fields on map but excludes them on reverse", () => {
        const m = new Mapping({ schema: {
            id: { key: "id", type: "int", readOnly: true },
            name: { key: "name", type: "string" },
        }, strict: true });
        expect(m.map({ id: 3, name: "a" })).toEqual({ id: 3, name: "a" });
        expect(m.reverse({ id: 3, name: "a" })).toEqual({ name: "a" });
    });
});

describe("Mapping - alsoWrite (one front field -> many server keys)", () => {
    it("fans the value out to extra server keys on reverse", () => {
        const m = new Mapping({ schema: {
            socid: { key: "socid", type: "int", alsoWrite: ["fk_soc"] },
        }, strict: true });
        expect(m.reverse({ socid: 7 })).toEqual({ socid: 7, fk_soc: 7 });
    });
});

describe("Mapping - items (arrays)", () => {
    it("maps array elements both ways", () => {
        const m = new Mapping({ schema: {
            lines: { key: "lines", items: { total_ht: { key: "totalHt", type: "float" } } },
        }, strict: true });
        expect(m.map({ lines: [{ total_ht: "10" }, { total_ht: "20" }] }))
            .toEqual({ lines: [{ totalHt: 10 }, { totalHt: 20 }] });
        expect(m.reverse({ lines: [{ totalHt: 10 }] }))
            .toEqual({ lines: [{ total_ht: 10 }] });
    });
});

// ---------------------------------------------------------------------------
// REAL dolipocket patterns: prove the extension covers what the hand-written
// mapFromBackend/mapToBackend did.
// ---------------------------------------------------------------------------
describe("Mapping - dolipocket thirdparty pattern", () => {
    const m = new Mapping({ schema: {
        id:          { key: "id",          type: "int",    aliases: ["rowid"], readOnly: true },
        name:        { key: "name",        type: "string", default: "" },
        note_public: { key: "notePublic",  type: "string", default: "" },
        status:      { key: "status",      type: "int",    default: 1 },
        datec:       { key: "createdAt",   type: "int",    default: 0, readOnly: true },
        tms:         { key: "updatedAt",   type: "int",    default: 0, readOnly: true },
    }, strict: true });

    it("reads with multi-source id, coercion and complete shape", () => {
        expect(m.map({ rowid: "42", name: "ACME", status: "1" }))
            .toEqual({ id: 42, name: "ACME", notePublic: "", status: 1, createdAt: 0, updatedAt: 0 });
    });

    it("writes back without read-only/computed fields", () => {
        const local = { id: 42, name: "ACME", notePublic: "hi", status: 1, createdAt: 111, updatedAt: 222 };
        expect(m.reverse(local)).toEqual({ name: "ACME", note_public: "hi", status: 1 });
    });
});

// ---------------------------------------------------------------------------
// HARDENING: exact cases surfaced by adversarial verification.
// ---------------------------------------------------------------------------
describe("Mapping - hardening (adversarial fixes)", () => {
    it("does not leak the raw alias source key in loose (strict:false) mode", () => {
        const m = new Mapping({ schema: { id: { key: "id", type: "int", aliases: ["rowid"] } } });
        expect(m.map({ rowid: 9 })).toEqual({ id: 9 });
        expect(m.map({ rowid: "9", other: "z" })).toEqual({ id: 9, other: "z" });
    });

    it("falls back to the alias when the primary key is null (Dolibarr empty FK)", () => {
        const m = new Mapping({ schema: { socid: { key: "socid", type: "int", aliases: ["fk_soc"] } }, strict: true });
        expect(m.map({ socid: null, fk_soc: 5 })).toEqual({ socid: 5 });
    });

    it("uses the default when primary is null and no alias hits", () => {
        const m = new Mapping({ schema: { socid: { key: "socid", type: "int", aliases: ["fk_soc"], default: -1 } }, strict: true });
        expect(m.map({ socid: null })).toEqual({ socid: -1 });
    });

    it("coerces the default value with `type` (consistent output type)", () => {
        const m = new Mapping({ schema: { n: { key: "n", type: "int", default: "5" } } });
        expect(m.map({})).toEqual({ n: 5 });
    });

    it("reverse honours `default` as the coercion fallback", () => {
        const m = new Mapping({ schema: { n: { key: "n", type: "int", default: 99 } } });
        expect(m.reverse({ n: "abc" })).toEqual({ n: 99 });
    });

    it("treats Dolibarr-style '0'/'false' strings as false for type bool", () => {
        const m = new Mapping({ schema: { a: { key: "a", type: "bool" }, b: { key: "b", type: "bool" } } });
        expect(m.map({ a: "0", b: "1" })).toEqual({ a: false, b: true });
        expect(m.map({ a: "false", b: "true" })).toEqual({ a: false, b: true });
    });
});

// ---------------------------------------------------------------------------
// SYSTEMIC fixes surfaced by the migration fan-out (round 2).
// ---------------------------------------------------------------------------
describe("Mapping - array-like (length) safety", () => {
    // lodash map(data, fn) treats an object carrying a numeric `length` as an
    // array-like and iterates by index -> total data loss. Object.keys is safe.
    const m = new Mapping({ schema: {
        ref:    { key: "ref",    type: "string" },
        length: { key: "length", type: "int" },
        width:  { key: "width",  type: "int" },
    }, strict: true });

    it("maps an object with a numeric `length` key without losing data", () => {
        expect(m.map({ ref: "P1", length: 10, width: 5 })).toEqual({ ref: "P1", length: 10, width: 5 });
        expect(m.map({ ref: "P1", length: 0, width: 5 })).toEqual({ ref: "P1", length: 0, width: 5 });
    });

    it("reverses an object with a numeric `length` key without losing data", () => {
        expect(m.reverse({ ref: "P1", length: 10, width: 5 })).toEqual({ ref: "P1", length: 10, width: 5 });
    });
});

describe("Mapping - write-side completeness (defaults on reverse)", () => {
    const m = new Mapping({ schema: {
        label:     { key: "label",    type: "string", default: "" },
        statut:    { key: "statut",   type: "int",    default: 1 },
        fk_parent: { key: "fkParent", type: "int",    default: 0 },
    }, strict: true });

    it("backfills absent writable fields with their defaults (complete payload)", () => {
        expect(m.reverse({ label: "Solo" })).toEqual({ label: "Solo", statut: 1, fk_parent: 0 });
        expect(m.reverse({})).toEqual({ label: "", statut: 1, fk_parent: 0 });
    });
});

describe("Mapping - writeFrom (write-side front-key fallback)", () => {
    // socid/fk_soc redundancy: front carries both socid & fkSoc; server wants
    // both socid & fk_soc; each side falls back to the other.
    const m = new Mapping({ schema: {
        socid:  { key: "socid", type: "int", aliases: ["fk_soc"], writeFrom: ["fkSoc"], default: 0 },
        fk_soc: { key: "fkSoc", type: "int", aliases: ["socid"],  writeFrom: ["socid"], default: 0 },
    }, strict: true });

    it("reads either server key into both front keys", () => {
        expect(m.map({ fk_soc: "5" })).toEqual({ socid: 5, fkSoc: 5 });
        expect(m.map({ socid: "8" })).toEqual({ socid: 8, fkSoc: 8 });
    });

    it("writes both server keys from either front key", () => {
        expect(m.reverse({ fkSoc: 7 })).toEqual({ socid: 7, fk_soc: 7 });
        expect(m.reverse({ socid: 9 })).toEqual({ socid: 9, fk_soc: 9 });
    });

    it("recovers from a null primary front key via the fallback", () => {
        expect(m.reverse({ socid: null, fkSoc: 7 })).toEqual({ socid: 7, fk_soc: 7 });
    });
});

describe("Mapping - items robustness", () => {
    const m = new Mapping({ schema: {
        lines: { key: "lines", items: { id: { key: "id", type: "int" } }, default: [] },
    }, strict: true });

    it("collapses a non-array to [] and drops null / non-object entries", () => {
        expect(m.map({ lines: "nope" })).toEqual({ lines: [] });
        expect(m.map({ lines: [null, "x", { id: "3" }, 7] })).toEqual({ lines: [{ id: 3 }] });
        expect(m.map({})).toEqual({ lines: [] });
    });
});

describe("Mapping - omitEmpty (conditional write, no backfill)", () => {
    const m = new Mapping({ schema: {
        fk_product:     { key: "fkProduct",     type: "int", default: 0 },
        datem:          { key: "datem",         from: (v) => Number(v) || 0, to: (v) => String(v), default: 0, omitEmpty: true },
        type_mouvement: { key: "typeMouvement", type: "int", default: 0, omitEmpty: true },
    }, strict: true });

    it("omits an empty field on write and never backfills its default", () => {
        expect(m.reverse({ fkProduct: 5 })).toEqual({ fk_product: 5 });
        expect(m.reverse({ fkProduct: 5, datem: "", typeMouvement: null })).toEqual({ fk_product: 5 });
    });

    it("writes the field (transformed) when it carries a real value", () => {
        expect(m.reverse({ fkProduct: 5, datem: 1700000000, typeMouvement: 3 }))
            .toEqual({ fk_product: 5, datem: "1700000000", type_mouvement: 3 });
    });

    it("still applies the default on READ (omitEmpty only affects write)", () => {
        expect(m.map({ fk_product: "5" })).toEqual({ fkProduct: 5, datem: 0, typeMouvement: 0 });
    });
});

describe("Mapping - dolipocket proposal-with-lines pattern", () => {
    const m = new Mapping({ schema: {
        id:       { key: "id",       type: "int",    readOnly: true },
        ref:      { key: "ref",      type: "string", readOnly: true },
        socid:    { key: "socid",    type: "int",    aliases: ["fk_soc"], alsoWrite: ["fk_soc"] },
        total_ht: { key: "totalHt",  type: "float",  readOnly: true },
        lines:    { key: "lines",    readOnly: true,  items: {
            fk_product: { key: "fkProduct", type: "int" },
            qty:        { key: "qty",       type: "float" },
        } },
    }, strict: true });

    it("reads socid from fk_soc, maps lines, keeps computed fields", () => {
        expect(m.map({ ref: "PR1", fk_soc: "5", total_ht: "100", lines: [{ fk_product: "9", qty: "2" }] }))
            .toEqual({ ref: "PR1", socid: 5, totalHt: 100, lines: [{ fkProduct: 9, qty: 2 }] });
    });

    it("writes socid + fk_soc and drops read-only header/lines", () => {
        const local = { id: 1, ref: "PR1", socid: 5, totalHt: 100, lines: [{ fkProduct: 9, qty: 2 }] };
        expect(m.reverse(local)).toEqual({ socid: 5, fk_soc: 5 });
    });
});
