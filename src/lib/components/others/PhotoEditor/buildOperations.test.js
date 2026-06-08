import { describe, it, expect } from "vitest";

import { buildOperations } from "./buildOperations";

describe("buildOperations", () => {
    it("returns an empty list for the neutral state", () => {
        expect(buildOperations({})).toEqual([]);
        expect(buildOperations()).toEqual([]);
    });

    it("emits a rotate90 only for a non-multiple-of-4 step count", () => {
        expect(buildOperations({ rotateSteps: 1 })).toEqual([{ type: "rotate90", steps: 1 }]);
        expect(buildOperations({ rotateSteps: 4 })).toEqual([]);
        expect(buildOperations({ rotateSteps: 0 })).toEqual([]);
    });

    it("emits straighten only for a non-zero angle", () => {
        expect(buildOperations({ straightenAngle: 3 })).toEqual([
            { type: "straighten", angle: 3 },
        ]);
        expect(buildOperations({ straightenAngle: 0 })).toEqual([]);
    });

    it("emits a single flip op carrying both axes", () => {
        expect(buildOperations({ flipH: true })).toEqual([
            { type: "flip", flipH: true, flipV: false },
        ]);
        expect(buildOperations({ flipH: true, flipV: true })).toEqual([
            { type: "flip", flipH: true, flipV: true },
        ]);
        expect(buildOperations({ flipH: false, flipV: false })).toEqual([]);
    });

    it("skips a default-quad perspective but keeps a warped one", () => {
        const full = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
        ];
        expect(buildOperations({ perspective: { corners: full } })).toEqual([]);

        const warped = [
            { x: 0.1, y: 0.05 },
            { x: 0.9, y: 0.02 },
            { x: 0.95, y: 0.98 },
            { x: 0.05, y: 0.95 },
        ];
        expect(buildOperations({ perspective: { corners: warped } })).toEqual([
            { type: "perspective", corners: warped },
        ]);
    });

    it("skips a full-frame crop but keeps a partial one", () => {
        expect(buildOperations({ crop: { x: 0, y: 0, w: 1, h: 1 } })).toEqual([]);
        const crop = { x: 0.1, y: 0.1, w: 0.5, h: 0.5 };
        expect(buildOperations({ crop })).toEqual([{ type: "crop", rect: crop }]);
    });

    it("combines several tools in canonical order", () => {
        const ops = buildOperations({
            rotateSteps: 1,
            straightenAngle: 2,
            flipH: true,
            perspective: {
                corners: [
                    { x: 0.1, y: 0.05 },
                    { x: 0.9, y: 0.02 },
                    { x: 0.95, y: 0.98 },
                    { x: 0.05, y: 0.95 },
                ],
            },
            crop: { x: 0.1, y: 0.1, w: 0.5, h: 0.5 },
        });
        expect(ops.map((o) => o.type)).toEqual([
            "rotate90",
            "straighten",
            "flip",
            "perspective",
            "crop",
        ]);
    });
});
