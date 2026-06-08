// Pure crop-rectangle maths, expressed in normalized coordinates (0..1) over
// the displayed base image. No DOM: fully unit-testable. The component layer
// only translates pointer events into normalized deltas and calls these.

const MIN_SIZE = 0.05; // never let the crop frame collapse below 5%

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// Keep a rect inside [0,1] on both axes, enforcing a minimum size.
export const clampRect = (rect) => {
    const w = clamp(rect.w, MIN_SIZE, 1);
    const h = clamp(rect.h, MIN_SIZE, 1);
    const x = clamp(rect.x, 0, 1 - w);
    const y = clamp(rect.y, 0, 1 - h);
    return { x, y, w, h };
};

// True when the rect covers (almost) the whole image, i.e. no real crop.
export const isFullRect = (rect, epsilon = 1e-3) =>
    !rect ||
    (rect.x <= epsilon &&
        rect.y <= epsilon &&
        rect.w >= 1 - epsilon &&
        rect.h >= 1 - epsilon);

export const FULL_RECT = { x: 0, y: 0, w: 1, h: 1 };

// Translate a rect by normalized deltas, clamped so it stays fully inside.
export const moveRect = (rect, dx, dy) =>
    clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy });

// Resize from one corner handle ("nw" | "ne" | "sw" | "se"). dx/dy are
// normalized deltas applied to the dragged corner; the opposite corner stays
// fixed. Returns a clamped rect that never crosses the anchor.
export const resizeRectFromHandle = (rect, handle, dx, dy) => {
    let { x, y, w, h } = rect;
    const right = x + w;
    const bottom = y + h;

    if (handle === "nw") {
        const nx = clamp(x + dx, 0, right - MIN_SIZE);
        const ny = clamp(y + dy, 0, bottom - MIN_SIZE);
        return { x: nx, y: ny, w: right - nx, h: bottom - ny };
    }
    if (handle === "ne") {
        const nr = clamp(right + dx, x + MIN_SIZE, 1);
        const ny = clamp(y + dy, 0, bottom - MIN_SIZE);
        return { x, y: ny, w: nr - x, h: bottom - ny };
    }
    if (handle === "sw") {
        const nx = clamp(x + dx, 0, right - MIN_SIZE);
        const nb = clamp(bottom + dy, y + MIN_SIZE, 1);
        return { x: nx, y, w: right - nx, h: nb - y };
    }
    // "se"
    const nr = clamp(right + dx, x + MIN_SIZE, 1);
    const nb = clamp(bottom + dy, y + MIN_SIZE, 1);
    return { x, y, w: nr - x, h: nb - y };
};

// Build a centered rect matching a target PIXEL aspect ratio (width/height).
// Because normalized coordinates are stretched by the base image dimensions,
// the ratio must be expressed against baseWidth/baseHeight. `aspect = null`
// returns the full rect (free / original).
export const rectForAspect = (aspect, baseWidth, baseHeight) => {
    if (!aspect || !baseWidth || !baseHeight) return { ...FULL_RECT };

    // We want (w * baseWidth) / (h * baseHeight) === aspect, with w or h = 1.
    // normalized ratio rN = w/h = aspect * baseHeight / baseWidth.
    const rN = (aspect * baseHeight) / baseWidth;
    let w = 1;
    let h = w / rN;
    if (h > 1) {
        h = 1;
        w = h * rN;
    }
    return clampRect({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
};
