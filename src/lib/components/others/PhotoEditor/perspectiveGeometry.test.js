import { describe, it, expect } from "vitest";

import { DEFAULT_CORNERS, isDefaultCorners, moveCorner } from "./perspectiveGeometry";

describe("isDefaultCorners", () => {
    it("is true for null/invalid and for the full-image quad", () => {
        expect(isDefaultCorners(null)).toBe(true);
        expect(isDefaultCorners([{ x: 0, y: 0 }])).toBe(true);
        expect(isDefaultCorners(DEFAULT_CORNERS)).toBe(true);
    });

    it("is false once a corner is pulled in", () => {
        const corners = DEFAULT_CORNERS.map((c) => ({ ...c }));
        corners[0] = { x: 0.1, y: 0.05 };
        expect(isDefaultCorners(corners)).toBe(false);
    });

    it("tolerates sub-epsilon noise", () => {
        const corners = DEFAULT_CORNERS.map((c) => ({ x: c.x + 1e-4, y: c.y }));
        expect(isDefaultCorners(corners)).toBe(true);
    });
});

describe("moveCorner", () => {
    it("moves only the targeted corner and clamps to [0,1]", () => {
        const moved = moveCorner(DEFAULT_CORNERS, 0, 0.2, 0.3);
        expect(moved[0]).toEqual({ x: 0.2, y: 0.3 });
        expect(moved[1]).toEqual(DEFAULT_CORNERS[1]);
    });

    it("clamps a corner dragged out of bounds", () => {
        const moved = moveCorner(DEFAULT_CORNERS, 2, 1, 1); // BR already at (1,1)
        expect(moved[2]).toEqual({ x: 1, y: 1 });
        const movedNeg = moveCorner(DEFAULT_CORNERS, 0, -1, -1);
        expect(movedNeg[0]).toEqual({ x: 0, y: 0 });
    });

    it("does not mutate the input array", () => {
        const input = DEFAULT_CORNERS.map((c) => ({ ...c }));
        moveCorner(input, 1, 0.1, 0.1);
        expect(input[1]).toEqual({ x: 1, y: 0 });
    });
});
