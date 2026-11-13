/**
 * Brand and error colours come from the theme.
 *
 * A component drawing its main action in bg-blue-600 or its error in
 * text-red-600 ignores the app's primary and error colours: the validate key
 * of a PinPad stayed blue in a teal app. This test reads every component
 * source and lists each fixed blue or red Tailwind class.
 */

import { describe, it, expect } from "vitest";

const sources = import.meta.glob("../components/**/*.jsx", { query: "?raw", import: "default", eager: true });

const FIXED_BRAND = /(?:^|[\s"'`:])(?:[a-z-]+:)*(?:bg|text|border|ring|shadow|from|to|fill|stroke)-(?:blue|red)-\d{2,3}(?:\/\d+)?/g;

// Developer tools draw their own console colours on purpose.
const EXEMPT = /\.test\.jsx$|\/stories\/|\/pages\/|\/DebugConsole\/|\/DebugWarnings\//;

describe("Theme colours", () => {
    it("draws brand and error colours with theme tokens, not fixed blue or red", () => {
        const offenders = [];
        for (const [path, source] of Object.entries(sources)) {
            if (EXEMPT.test(path)) continue;
            const matches = source.match(FIXED_BRAND);
            if (matches) {
                offenders.push(`${path}: ${[...new Set(matches.map((m) => m.trim()))].join(" ")}`);
            }
        }
        expect(offenders).toEqual([]);
    });
});
