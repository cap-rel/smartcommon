import { describe, it, expect } from "vitest";

import { formatBadgeCount, BADGE_MAX_COUNT } from "./badge";

describe("formatBadgeCount", () => {
    it.each([
        [null],
        [undefined],
        [0],
        [-3],
        [0.4],
        [Number.NaN],
        [Number.POSITIVE_INFINITY],
        [""],
        ["   "],
        ["0"],
        ["000"],
    ])("shows no badge for %p", (value) => {
        expect(formatBadgeCount(value)).toBeNull();
    });

    it.each([
        [1, "1"],
        [7, "7"],
        [99, "99"],
        [3.9, "3"],
        ["12", "12"],
        [" 5 ", "5"],
    ])("renders the count %p as %p", (value, expected) => {
        expect(formatBadgeCount(value)).toBe(expected);
    });

    it("caps a count above the maximum", () => {
        expect(BADGE_MAX_COUNT).toBe(99);
        expect(formatBadgeCount(100)).toBe("99+");
        expect(formatBadgeCount(12345)).toBe("99+");
        expect(formatBadgeCount("150")).toBe("99+");
    });

    it("honours a custom maximum", () => {
        expect(formatBadgeCount(10, 9)).toBe("9+");
        expect(formatBadgeCount(9, 9)).toBe("9");
    });

    it("keeps a short text as given", () => {
        expect(formatBadgeCount("new")).toBe("new");
        expect(formatBadgeCount("!")).toBe("!");
    });
});
