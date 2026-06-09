import { describe, it, expect } from "vitest";

import {
    toGrayValue,
    grayscaleArray,
    otsuThreshold,
    buildFilterString,
    computeStretchBounds,
} from "./pixels";

describe("toGrayValue", () => {
    it("maps pure white and black", () => {
        expect(toGrayValue(255, 255, 255)).toBeCloseTo(255, 5);
        expect(toGrayValue(0, 0, 0)).toBe(0);
    });
    it("weights green most (Rec.601)", () => {
        expect(toGrayValue(0, 255, 0)).toBeCloseTo(149.685, 3);
    });
});

describe("grayscaleArray", () => {
    it("produces one luma sample per pixel", () => {
        // 2x1 image: white then black
        const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
        const gray = grayscaleArray({ data, width: 2, height: 1 });
        expect(gray.length).toBe(2);
        expect(gray[0]).toBe(255);
        expect(gray[1]).toBe(0);
    });
});

describe("otsuThreshold", () => {
    it("returns 0 for empty input", () => {
        expect(otsuThreshold(new Uint8ClampedArray(0))).toBe(0);
    });

    it("finds a cut between two well-separated modes", () => {
        // half the pixels near 30, half near 220
        const gray = new Uint8ClampedArray(2000);
        for (let i = 0; i < 1000; i++) gray[i] = 30;
        for (let i = 1000; i < 2000; i++) gray[i] = 220;
        const t = otsuThreshold(gray);
        expect(t).toBeGreaterThanOrEqual(30);
        expect(t).toBeLessThan(220);
    });
});

describe("computeStretchBounds", () => {
    it("returns a no-op range for empty input", () => {
        expect(computeStretchBounds(new Uint8ClampedArray(0))).toEqual({ lo: 0, hi: 255 });
    });

    it("returns a no-op range for a flat image", () => {
        const flat = new Uint8ClampedArray(100).fill(120);
        expect(computeStretchBounds(flat, 0)).toEqual({ lo: 0, hi: 255 });
    });

    it("finds the actual min/max of a compressed tonal range (no clip)", () => {
        const gray = new Uint8ClampedArray(151);
        for (let v = 50; v <= 200; v++) gray[v - 50] = v;
        expect(computeStretchBounds(gray, 0)).toEqual({ lo: 50, hi: 200 });
    });

    it("trims outliers when clipping", () => {
        // 990 mid-tone pixels spread over 60..200, plus a few hard outliers.
        const gray = new Uint8ClampedArray(1000);
        for (let i = 0; i < 990; i++) gray[i] = 60 + (i % 141);
        for (let i = 990; i < 995; i++) gray[i] = 0;
        for (let i = 995; i < 1000; i++) gray[i] = 255;

        const noClip = computeStretchBounds(gray, 0);
        expect(noClip).toEqual({ lo: 0, hi: 255 });

        const clipped = computeStretchBounds(gray, 0.02);
        expect(clipped.lo).toBeGreaterThan(0);
        expect(clipped.hi).toBeLessThan(255);
    });
});

describe("buildFilterString", () => {
    it("defaults to a neutral filter", () => {
        expect(buildFilterString()).toBe("brightness(1.000) contrast(1.000) saturate(1.000)");
    });
    it("offsets each channel from its neutral 1.0", () => {
        expect(buildFilterString({ brightness: 0.2, contrast: -0.1, saturation: 0.5 })).toBe(
            "brightness(1.200) contrast(0.900) saturate(1.500)"
        );
    });
    it("adds a hue rotation only when temperature is set", () => {
        expect(buildFilterString({ temperature: 1 })).toContain("hue-rotate(20.00deg)");
        expect(buildFilterString({ temperature: 0 })).not.toContain("hue-rotate");
    });
});
