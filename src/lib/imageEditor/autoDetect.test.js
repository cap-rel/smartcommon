import { describe, it, expect } from "vitest";

import { detectDocumentQuad } from "./autoDetect";

// Build a grayscale RGBA image from a paint(x, y) -> 0..255 function.
const makeImage = (width, height, paint) => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const v = paint(x, y);
            const i = (y * width + x) * 4;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 255;
        }
    }
    return { data, width, height };
};

const rect = (x0, y0, x1, y1, inside, outside) => (x, y) =>
    x >= x0 && x < x1 && y >= y0 && y < y1 ? inside : outside;

describe("detectDocumentQuad", () => {
    it("returns null for a degenerate (zero-size) image", () => {
        expect(detectDocumentQuad({ data: new Uint8ClampedArray(0), width: 0, height: 0 })).toBeNull();
    });

    it("returns null for a uniform image (no document)", () => {
        const img = makeImage(100, 100, () => 128);
        expect(detectDocumentQuad(img)).toBeNull();
    });

    it("finds a bright card on a dark background", () => {
        const img = makeImage(100, 100, rect(20, 20, 80, 80, 255, 0));
        const corners = detectDocumentQuad(img);
        expect(corners).not.toBeNull();
        const [tl, tr, br, bl] = corners;
        expect(tl.x).toBeCloseTo(20 / 99, 2);
        expect(tl.y).toBeCloseTo(20 / 99, 2);
        expect(tr.x).toBeCloseTo(79 / 99, 2);
        expect(br.y).toBeCloseTo(79 / 99, 2);
        expect(bl.x).toBeCloseTo(20 / 99, 2);
    });

    it("finds a dark card on a bright background (inverted polarity)", () => {
        const img = makeImage(100, 100, rect(30, 25, 75, 85, 0, 255));
        const corners = detectDocumentQuad(img);
        expect(corners).not.toBeNull();
        const [tl, , br] = corners;
        expect(tl.x).toBeCloseTo(30 / 99, 2);
        expect(tl.y).toBeCloseTo(25 / 99, 2);
        expect(br.x).toBeCloseTo(74 / 99, 2);
        expect(br.y).toBeCloseTo(84 / 99, 2);
    });

    it("returns null when the document fills the whole frame", () => {
        // white everywhere except a 1px dark border -> quad hugs the corners
        const img = makeImage(100, 100, (x, y) =>
            x === 0 || y === 0 || x === 99 || y === 99 ? 0 : 255
        );
        expect(detectDocumentQuad(img)).toBeNull();
    });

    it("returns null when the foreground is too small", () => {
        // a tiny 3x3 bright speck on dark -> below the min area fraction
        const img = makeImage(100, 100, rect(10, 10, 13, 13, 255, 0));
        expect(detectDocumentQuad(img)).toBeNull();
    });
});
