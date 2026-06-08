import { describe, it, expect } from "vitest";

import {
    clampRect,
    isFullRect,
    FULL_RECT,
    moveRect,
    resizeRectFromHandle,
    rectForAspect,
} from "./cropGeometry";

describe("clampRect", () => {
    it("keeps a valid rect inside the unit square", () => {
        expect(clampRect({ x: 0.1, y: 0.2, w: 0.5, h: 0.3 })).toEqual({
            x: 0.1,
            y: 0.2,
            w: 0.5,
            h: 0.3,
        });
    });
    it("clamps an out-of-bounds rect back inside", () => {
        const r = clampRect({ x: 0.9, y: 0.9, w: 0.5, h: 0.5 });
        expect(r.x + r.w).toBeLessThanOrEqual(1 + 1e-9);
        expect(r.y + r.h).toBeLessThanOrEqual(1 + 1e-9);
    });
    it("enforces a minimum size", () => {
        const r = clampRect({ x: 0, y: 0, w: 0.001, h: 0.001 });
        expect(r.w).toBeGreaterThanOrEqual(0.05);
        expect(r.h).toBeGreaterThanOrEqual(0.05);
    });
});

describe("isFullRect", () => {
    it("is true for null and for the full rect", () => {
        expect(isFullRect(null)).toBe(true);
        expect(isFullRect(FULL_RECT)).toBe(true);
    });
    it("is false for a partial rect", () => {
        expect(isFullRect({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })).toBe(false);
    });
});

describe("moveRect", () => {
    it("translates and clamps to stay inside", () => {
        const r = moveRect({ x: 0.4, y: 0.4, w: 0.4, h: 0.4 }, 0.5, 0.5);
        expect(r.x).toBeCloseTo(0.6, 6);
        expect(r.y).toBeCloseTo(0.6, 6);
        expect(r.x + r.w).toBeLessThanOrEqual(1 + 1e-9);
    });
});

describe("resizeRectFromHandle", () => {
    const base = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 };

    it("se handle grows width/height, anchor (top-left) fixed", () => {
        const r = resizeRectFromHandle(base, "se", 0.1, 0.1);
        expect(r.x).toBeCloseTo(0.2, 6);
        expect(r.y).toBeCloseTo(0.2, 6);
        expect(r.w).toBeCloseTo(0.5, 6);
        expect(r.h).toBeCloseTo(0.5, 6);
    });

    it("nw handle moves the top-left, anchor (bottom-right) fixed", () => {
        const r = resizeRectFromHandle(base, "nw", 0.1, 0.1);
        const right = base.x + base.w;
        const bottom = base.y + base.h;
        expect(r.x).toBeCloseTo(0.3, 6);
        expect(r.y).toBeCloseTo(0.3, 6);
        expect(r.x + r.w).toBeCloseTo(right, 6);
        expect(r.y + r.h).toBeCloseTo(bottom, 6);
    });

    it("never lets a handle cross its anchor (min size kept)", () => {
        const r = resizeRectFromHandle(base, "se", -1, -1);
        // floating-point subtraction can land a hair under MIN_SIZE; the
        // component additionally runs the result through clampRect.
        expect(r.w).toBeGreaterThanOrEqual(0.05 - 1e-9);
        expect(r.h).toBeGreaterThanOrEqual(0.05 - 1e-9);
    });
});

describe("rectForAspect", () => {
    it("returns the full rect for a null aspect", () => {
        expect(rectForAspect(null, 200, 100)).toEqual(FULL_RECT);
    });

    it("produces a square pixel crop on a landscape base", () => {
        // base 200x100, square ratio -> normalized 0.5 x 1, centered
        const r = rectForAspect(1, 200, 100);
        expect(r.w).toBeCloseTo(0.5, 6);
        expect(r.h).toBeCloseTo(1, 6);
        expect(r.x).toBeCloseTo(0.25, 6);
        // pixel dimensions are actually square
        expect(r.w * 200).toBeCloseTo(r.h * 100, 6);
    });

    it("produces a square pixel crop on a portrait base", () => {
        const r = rectForAspect(1, 100, 200);
        expect(r.h).toBeCloseTo(0.5, 6);
        expect(r.w).toBeCloseTo(1, 6);
        expect(r.w * 100).toBeCloseTo(r.h * 200, 6);
    });
});
