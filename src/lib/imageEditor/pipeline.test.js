import { describe, it, expect } from "vitest";

import { sortOperations, applyPipeline } from "./pipeline";
import { registerOperation } from "./operations";

describe("sortOperations", () => {
    it("orders built-in operations by stage (geometry before color)", () => {
        const shuffled = [
            { type: "scan" },
            { type: "crop" },
            { type: "adjust" },
            { type: "perspective" },
            { type: "rotate90" },
            { type: "flip" },
            { type: "straighten" },
        ];
        expect(sortOperations(shuffled).map((o) => o.type)).toEqual([
            "rotate90",
            "straighten",
            "flip",
            "perspective",
            "crop",
            "adjust",
            "scan",
        ]);
    });

    it("keeps insertion order for equal stages and does not mutate the input", () => {
        registerOperation("test:eqA", { stage: 200, apply: (c) => c });
        registerOperation("test:eqB", { stage: 200, apply: (c) => c });
        const input = [{ type: "test:eqB", tag: 1 }, { type: "test:eqA", tag: 2 }];
        const sorted = sortOperations(input);
        expect(sorted.map((o) => o.tag)).toEqual([1, 2]);
        // original array untouched
        expect(input.map((o) => o.tag)).toEqual([1, 2]);
    });

    it("treats unknown operations as last (default stage 100) ", () => {
        const ops = [{ type: "mystery" }, { type: "perspective" }];
        expect(sortOperations(ops).map((o) => o.type)).toEqual(["perspective", "mystery"]);
    });
});

describe("applyPipeline (orchestration, canvas-free fakes)", () => {
    it("threads the canvas through operations in stage order", () => {
        const calls = [];
        registerOperation("test:first", {
            stage: 1,
            apply: (value) => {
                calls.push("first");
                return value + 1;
            },
        });
        registerOperation("test:second", {
            stage: 2,
            apply: (value) => {
                calls.push("second");
                return value * 10;
            },
        });

        // Pass operations out of order to prove sorting drives execution.
        const result = applyPipeline(0, [{ type: "test:second" }, { type: "test:first" }]);
        expect(calls).toEqual(["first", "second"]);
        expect(result).toBe((0 + 1) * 10);
    });

    it("skips an unknown operation instead of throwing", () => {
        registerOperation("test:passthrough", { stage: 1, apply: (v) => v + 5 });
        const result = applyPipeline(0, [{ type: "does-not-exist" }, { type: "test:passthrough" }]);
        expect(result).toBe(5);
    });

    it("returns the input untouched for an empty operation list", () => {
        const canvasLike = { id: "untouched" };
        expect(applyPipeline(canvasLike, [])).toBe(canvasLike);
    });
});
