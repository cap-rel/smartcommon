import { describe, it, expect } from "vitest";

import { isEmptyValue } from "./emptiness";

describe("isEmptyValue", () => {
    it.each([undefined, null, "", NaN, [], {}])("treats %o as empty", (value) => {
        expect(isEmptyValue(value)).toBe(true);
    });

    it.each([0, 42, -1.5, 1700000000000, false, true, "a", [0], { a: 1 }])("treats %o as filled", (value) => {
        expect(isEmptyValue(value)).toBe(false);
    });
});
