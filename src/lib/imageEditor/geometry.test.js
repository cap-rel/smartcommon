import { describe, it, expect } from "vitest";

import {
    clamp01,
    rotateDimensions,
    rotatedRectWithMaxArea,
    distance,
    solveLinear,
    getPerspectiveTransform,
    applyMatrix,
    invert3x3,
} from "./geometry";

describe("clamp01", () => {
    it.each([
        [-1, 0],
        [0, 0],
        [0.5, 0.5],
        [1, 1],
        [2, 1],
    ])("clamps %s to %s", (input, expected) => {
        expect(clamp01(input)).toBe(expected);
    });
});

describe("rotateDimensions", () => {
    it("keeps dimensions on even quarter-turns", () => {
        expect(rotateDimensions(4, 3, 0)).toEqual({ width: 4, height: 3 });
        expect(rotateDimensions(4, 3, 2)).toEqual({ width: 4, height: 3 });
    });
    it("swaps dimensions on odd quarter-turns", () => {
        expect(rotateDimensions(4, 3, 1)).toEqual({ width: 3, height: 4 });
        expect(rotateDimensions(4, 3, 3)).toEqual({ width: 3, height: 4 });
    });
    it("normalizes negative and large step counts", () => {
        expect(rotateDimensions(4, 3, -1)).toEqual({ width: 3, height: 4 });
        expect(rotateDimensions(4, 3, 5)).toEqual({ width: 3, height: 4 });
    });
});

describe("rotatedRectWithMaxArea", () => {
    it("returns the full rectangle at angle 0", () => {
        const r = rotatedRectWithMaxArea(100, 60, 0);
        expect(r.width).toBeCloseTo(100, 5);
        expect(r.height).toBeCloseTo(60, 5);
    });
    it("inscribes a square rotated 45 degrees (side / sqrt2)", () => {
        const r = rotatedRectWithMaxArea(1, 1, Math.PI / 4);
        expect(r.width).toBeCloseTo(Math.SQRT1_2, 5);
        expect(r.height).toBeCloseTo(Math.SQRT1_2, 5);
    });
    it("never exceeds the original dimensions", () => {
        const r = rotatedRectWithMaxArea(200, 100, 0.2);
        expect(r.width).toBeLessThanOrEqual(200 + 1e-9);
        expect(r.height).toBeLessThanOrEqual(100 + 1e-9);
        expect(r.width).toBeGreaterThan(0);
        expect(r.height).toBeGreaterThan(0);
    });
    it("guards against non-positive input", () => {
        expect(rotatedRectWithMaxArea(0, 10, 0.3)).toEqual({ width: 0, height: 0 });
    });
});

describe("distance", () => {
    it("computes the euclidean distance", () => {
        expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    });
});

describe("solveLinear", () => {
    it("solves a simple 2x2 system", () => {
        // x + y = 3 ; x - y = 1  -> x = 2, y = 1
        const x = solveLinear([[1, 1], [1, -1]], [3, 1]);
        expect(x[0]).toBeCloseTo(2, 6);
        expect(x[1]).toBeCloseTo(1, 6);
    });
    it("returns null for a singular system", () => {
        expect(solveLinear([[1, 1], [2, 2]], [1, 2])).toBeNull();
    });
});

describe("getPerspectiveTransform / applyMatrix", () => {
    const unit = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
    ];

    it("returns an identity-like transform for identical src/dst", () => {
        const H = getPerspectiveTransform(unit, unit);
        const p = applyMatrix(H, 0.3, 0.7);
        expect(p.x).toBeCloseTo(0.3, 6);
        expect(p.y).toBeCloseTo(0.7, 6);
    });

    it("maps the four control points exactly", () => {
        const dst = [
            { x: 10, y: 20 },
            { x: 110, y: 10 },
            { x: 120, y: 90 },
            { x: 0, y: 100 },
        ];
        const H = getPerspectiveTransform(unit, dst);
        unit.forEach((src, i) => {
            const p = applyMatrix(H, src.x, src.y);
            expect(p.x).toBeCloseTo(dst[i].x, 4);
            expect(p.y).toBeCloseTo(dst[i].y, 4);
        });
    });

    it("returns null for degenerate (collinear) points", () => {
        const degenerate = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        expect(getPerspectiveTransform(unit, degenerate)).toBeNull();
    });
});

describe("invert3x3", () => {
    it("inverts then re-applies to recover a point (round-trip)", () => {
        const dst = [
            { x: 5, y: 8 },
            { x: 95, y: 3 },
            { x: 100, y: 88 },
            { x: 2, y: 92 },
        ];
        const unit = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
        ];
        const H = getPerspectiveTransform(unit, dst);
        const inv = invert3x3(H);
        const forward = applyMatrix(H, 0.42, 0.6);
        const back = applyMatrix(inv, forward.x, forward.y);
        expect(back.x).toBeCloseTo(0.42, 5);
        expect(back.y).toBeCloseTo(0.6, 5);
    });

    it("returns null for a singular matrix", () => {
        expect(invert3x3([[1, 2, 3], [2, 4, 6], [1, 1, 1]])).toBeNull();
    });
});
