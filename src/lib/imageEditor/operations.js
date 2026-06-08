// Operation registry for the image editor pipeline. Each operation is a pure
// transform `apply(canvas, params) -> canvas`. New tools register here without
// touching the pipeline, which is what keeps the editor extensible.

import { createLogger } from "lib/utils";

import { createCanvas } from "./canvas";
import {
    rotateDimensions,
    rotatedRectWithMaxArea,
    getPerspectiveTransform,
    applyMatrix,
    distance,
} from "./geometry";
import { grayscaleArray, otsuThreshold, buildFilterString } from "./pixels";

const log = createLogger("imageEditor");

const registry = {};

// Register (or override) an operation. `stage` controls the canonical apply
// order: lower runs first (geometry before color). `apply(canvas, params)`
// returns a new canvas.
export const registerOperation = (type, { stage = 100, apply }) => {
    if (typeof apply !== "function") {
        log.error(`registerOperation: "${type}" has no apply function, ignored`);
        return;
    }
    registry[type] = { stage, apply };
};

export const getOperation = (type) => registry[type];

export const listOperations = () => Object.keys(registry);

// ----- built-in operations ------------------------------------------------

// Perspective warp: map the consumer quad (4 normalized corners, order
// TL,TR,BR,BL) onto a straight rectangle via inverse sampling. Runs after the
// other framing geometry so the quad is expressed in the same space the user
// drags it in (the rotated/straightened/flipped preview), and before crop.
registerOperation("perspective", {
    stage: 35,
    apply: (canvas, { corners, outWidth, outHeight }) => {
        if (!corners || corners.length !== 4) {
            log.warning("perspective: expected 4 corners, skipped");
            return canvas;
        }
        const W = canvas.width;
        const H = canvas.height;
        const src = corners.map((c) => ({ x: c.x * W, y: c.y * H }));

        const ow = Math.round(
            outWidth ?? Math.max(distance(src[0], src[1]), distance(src[3], src[2]))
        );
        const oh = Math.round(
            outHeight ?? Math.max(distance(src[0], src[3]), distance(src[1], src[2]))
        );
        const dst = [
            { x: 0, y: 0 },
            { x: ow, y: 0 },
            { x: ow, y: oh },
            { x: 0, y: oh },
        ];

        // dst -> src so we can sample backwards for each output pixel.
        const inverse = getPerspectiveTransform(dst, src);
        if (!inverse) {
            log.warning("perspective: degenerate corners, skipped");
            return canvas;
        }

        const srcData = canvas.getContext("2d").getImageData(0, 0, W, H).data;
        const out = createCanvas(ow, oh);
        const octx = out.getContext("2d");
        const dstImg = octx.createImageData(ow, oh);

        for (let y = 0; y < oh; y++) {
            for (let x = 0; x < ow; x++) {
                const p = applyMatrix(inverse, x, y);
                const sx = Math.round(p.x);
                const sy = Math.round(p.y);
                const di = (y * ow + x) * 4;
                if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
                    const si = (sy * W + sx) * 4;
                    dstImg.data[di] = srcData[si];
                    dstImg.data[di + 1] = srcData[si + 1];
                    dstImg.data[di + 2] = srcData[si + 2];
                    dstImg.data[di + 3] = srcData[si + 3];
                } else {
                    dstImg.data[di + 3] = 0;
                }
            }
        }
        octx.putImageData(dstImg, 0, 0);
        return out;
    },
});

// Crop to a normalized rect { x, y, w, h } (fractions of the current canvas).
// Runs after the other geometry so the rect is expressed in the same space the
// user sees in the straightened/rotated preview.
registerOperation("crop", {
    stage: 40,
    apply: (canvas, { rect }) => {
        if (!rect) {
            log.warning("crop: missing rect, skipped");
            return canvas;
        }
        const x = Math.round(rect.x * canvas.width);
        const y = Math.round(rect.y * canvas.height);
        const w = Math.round(rect.w * canvas.width);
        const h = Math.round(rect.h * canvas.height);
        const out = createCanvas(w, h);
        out.getContext("2d").drawImage(canvas, x, y, w, h, 0, 0, w, h);
        return out;
    },
});

// Rotate by whole quarter-turns (steps, clockwise).
registerOperation("rotate90", {
    stage: 10,
    apply: (canvas, { steps }) => {
        const s = ((steps % 4) + 4) % 4;
        if (s === 0) return canvas;
        const { width, height } = rotateDimensions(canvas.width, canvas.height, s);
        const out = createCanvas(width, height);
        const ctx = out.getContext("2d");
        ctx.translate(width / 2, height / 2);
        ctx.rotate((s * Math.PI) / 2);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        return out;
    },
});

// Free-angle straighten (degrees) with automatic crop of the empty corners.
registerOperation("straighten", {
    stage: 20,
    apply: (canvas, { angle }) => {
        if (!angle) return canvas;
        const rad = (angle * Math.PI) / 180;
        const W = canvas.width;
        const H = canvas.height;

        const rotated = createCanvas(W, H);
        const rctx = rotated.getContext("2d");
        rctx.translate(W / 2, H / 2);
        rctx.rotate(rad);
        rctx.drawImage(canvas, -W / 2, -H / 2);

        const { width: cw, height: ch } = rotatedRectWithMaxArea(W, H, rad);
        const out = createCanvas(cw, ch);
        out.getContext("2d").drawImage(
            rotated,
            (W - cw) / 2,
            (H - ch) / 2,
            cw,
            ch,
            0,
            0,
            Math.round(cw),
            Math.round(ch)
        );
        return out;
    },
});

// Mirror horizontally and/or vertically. Accepts either a single `axis`
// ("h"/"v", back-compat) or independent flipH/flipV booleans.
registerOperation("flip", {
    stage: 30,
    apply: (canvas, { axis, flipH, flipV } = {}) => {
        const fh = flipH ?? axis === "h";
        const fv = flipV ?? axis === "v";
        if (!fh && !fv) return canvas;
        const out = createCanvas(canvas.width, canvas.height);
        const ctx = out.getContext("2d");
        ctx.translate(fh ? canvas.width : 0, fv ? canvas.height : 0);
        ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
        ctx.drawImage(canvas, 0, 0);
        return out;
    },
});

// Light/color adjustments via the native canvas filter.
registerOperation("adjust", {
    stage: 50,
    apply: (canvas, params) => {
        const filter = buildFilterString(params);
        const out = createCanvas(canvas.width, canvas.height);
        const ctx = out.getContext("2d");
        ctx.filter = filter;
        ctx.drawImage(canvas, 0, 0);
        return out;
    },
});

// Document "scan" preset: grayscale then Otsu binarization (or plain grayscale
// when binarize is false).
registerOperation("scan", {
    stage: 60,
    apply: (canvas, { binarize = true } = {}) => {
        const W = canvas.width;
        const H = canvas.height;
        const ctx = canvas.getContext("2d");
        const img = ctx.getImageData(0, 0, W, H);
        const gray = grayscaleArray(img);
        const threshold = otsuThreshold(gray);

        for (let p = 0; p < gray.length; p++) {
            const v = binarize ? (gray[p] > threshold ? 255 : 0) : gray[p];
            const i = p * 4;
            img.data[i] = v;
            img.data[i + 1] = v;
            img.data[i + 2] = v;
        }

        const out = createCanvas(W, H);
        out.getContext("2d").putImageData(img, 0, 0);
        return out;
    },
});
