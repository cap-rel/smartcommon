import { describe, it, expect } from "vitest";

import { calculate, computePercent } from "./logic";

describe("Calculator logic", () => {
    describe("calculate", () => {
        it("adds, subtracts, multiplies, divides", () => {
            expect(calculate(2, 3, "+")).toBe(5);
            expect(calculate(5, 3, "-")).toBe(2);
            expect(calculate(4, 3, "×")).toBe(12);
            expect(calculate(6, 3, "÷")).toBe(2);
        });

        it("returns 0 on division by zero (no Infinity/NaN leaks to the UI)", () => {
            expect(calculate(5, 0, "÷")).toBe(0);
        });

        it("returns the right operand for an unknown operator", () => {
            expect(calculate(5, 7, "?")).toBe(7);
        });

        it("stays within IEEE-754 floating-point error", () => {
            // Documents the known FP behaviour: 0.1 + 0.2 !== 0.3 exactly.
            expect(calculate(0.1, 0.2, "+")).toBeCloseTo(0.3, 10);
        });
    });

    describe("computePercent", () => {
        it("is a percentage OF the accumulator for + and - (50 + 10% -> 5)", () => {
            expect(computePercent(10, 50, "+")).toBe(5);
            expect(computePercent(10, 50, "-")).toBe(5);
        });

        it("is the plain fraction for x and /", () => {
            expect(computePercent(10, 50, "×")).toBe(0.1);
            expect(computePercent(10, 50, "÷")).toBe(0.1);
        });

        it("falls back to divide-by-100 with no pending operator", () => {
            expect(computePercent(10, null, null)).toBe(0.1);
            expect(computePercent(250, null, null)).toBe(2.5);
        });
    });
});
