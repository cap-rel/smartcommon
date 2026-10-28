import { describe, it, expect, vi } from "vitest";

// The redact operation copies onto a fresh canvas; happy-dom provides no 2D
// context, so createCanvas is replaced by a recording fake.
vi.mock("./canvas", () => ({
    createCanvas: (width, height) => {
        const fillRects = [];
        const ctx = {
            fillStyle: null,
            drawImage: vi.fn(),
            fillRect: (x, y, w, h) => fillRects.push({ x, y, w, h, fillStyle: ctx.fillStyle }),
        };
        return { width, height, getContext: () => ctx, fillRects };
    },
}));

import { getOperation } from "./operations";

const srcCanvas = (width, height) => ({ width, height });

describe("redact operation", () => {
    it("is registered after every other stage", () => {
        expect(getOperation("redact").stage).toBeGreaterThan(getOperation("scan").stage);
    });

    it("paints opaque rectangles in pixel coordinates", () => {
        const out = getOperation("redact").apply(srcCanvas(200, 100), {
            rects: [{ x: 0.25, y: 0.5, w: 0.5, h: 0.25 }],
        });
        expect(out.width).toBe(200);
        expect(out.height).toBe(100);
        expect(out.fillRects).toEqual([{ x: 50, y: 50, w: 100, h: 25, fillStyle: "#000000" }]);
    });

    it("copies the source canvas before painting", () => {
        const src = srcCanvas(10, 10);
        const out = getOperation("redact").apply(src, { rects: [{ x: 0, y: 0, w: 1, h: 1 }] });
        expect(out.getContext("2d").drawImage).toHaveBeenCalledWith(src, 0, 0);
    });

    it("clamps rectangles that overflow the frame", () => {
        const out = getOperation("redact").apply(srcCanvas(200, 100), {
            rects: [{ x: -0.5, y: 0.25, w: 1, h: 1 }],
        });
        expect(out.fillRects).toEqual([{ x: 0, y: 25, w: 100, h: 75, fillStyle: "#000000" }]);
    });

    it("skips degenerate rectangles", () => {
        const out = getOperation("redact").apply(srcCanvas(100, 100), {
            rects: [
                { x: 0.5, y: 0.5, w: 0, h: 0.2 },
                { x: 0.1, y: 0.1, w: 0.2, h: 0.2 },
            ],
        });
        expect(out.fillRects).toEqual([{ x: 10, y: 10, w: 20, h: 20, fillStyle: "#000000" }]);
    });

    it("honours a custom fill color", () => {
        const out = getOperation("redact").apply(srcCanvas(10, 10), {
            rects: [{ x: 0, y: 0, w: 1, h: 1 }],
            color: "#ff0000",
        });
        expect(out.fillRects[0].fillStyle).toBe("#ff0000");
    });

    it("returns the input untouched when there is nothing to redact", () => {
        const src = srcCanvas(10, 10);
        expect(getOperation("redact").apply(src, {})).toBe(src);
        expect(getOperation("redact").apply(src, { rects: [] })).toBe(src);
    });
});
