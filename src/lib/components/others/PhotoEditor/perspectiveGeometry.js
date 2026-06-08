// Pure helpers for the perspective tool. Corners are 4 normalized {x, y}
// points (0..1) in order TL, TR, BR, BL, matching the engine's perspective op.

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// The quad covering the whole image (no warp).
export const DEFAULT_CORNERS = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
];

// True when the quad is (almost) the full image, i.e. nothing to rectify.
export const isDefaultCorners = (corners, epsilon = 1e-3) => {
    if (!corners || corners.length !== 4) return true;
    return corners.every(
        (c, i) =>
            Math.abs(c.x - DEFAULT_CORNERS[i].x) <= epsilon &&
            Math.abs(c.y - DEFAULT_CORNERS[i].y) <= epsilon
    );
};

// Move a single corner by normalized deltas, returning a new clamped quad.
export const moveCorner = (corners, index, dx, dy) =>
    corners.map((c, i) =>
        i === index ? { x: clamp01(c.x + dx), y: clamp01(c.y + dy) } : c
    );
