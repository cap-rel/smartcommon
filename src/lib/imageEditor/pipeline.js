// Non-destructive pipeline: an edit is an ordered list of operations applied
// over the source image. The same list drives the live preview (on a
// downscaled canvas) and the full-resolution export, and can be persisted as a
// re-applicable "recipe".

import { createLogger } from "lib/utils";

import { getOperation } from "./operations";
import { createCanvas, fitCanvas, canvasToBlob } from "./canvas";
import { loadBitmap } from "./loadImage";

const log = createLogger("imageEditor");

// Order operations by their registered stage (geometry before color), keeping
// insertion order as a stable tie-break. Pure given the registry.
export const sortOperations = (operations) =>
    operations
        .map((op, index) => ({ op, index }))
        .sort((a, b) => {
            const sa = getOperation(a.op.type)?.stage ?? 100;
            const sb = getOperation(b.op.type)?.stage ?? 100;
            return sa - sb || a.index - b.index;
        })
        .map((entry) => entry.op);

// Run the operation list over a canvas, returning the resulting canvas.
export const applyPipeline = (canvas, operations = []) => {
    let current = canvas;
    for (const op of sortOperations(operations)) {
        const def = getOperation(op.type);
        if (!def) {
            log.warning(`applyPipeline: unknown operation "${op.type}", skipped`);
            continue;
        }
        current = def.apply(current, op);
    }
    return current;
};

// Draw a decoded bitmap onto a fresh canvas (the pipeline's starting point).
export const bitmapToCanvas = (bitmap) => {
    const canvas = createCanvas(bitmap.width, bitmap.height);
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    return canvas;
};

// Full edit: decode the source (EXIF-normalized), run the pipeline, optionally
// downscale to maxWidth/maxHeight, and encode to a Blob.
export const applyImageEdits = async (source, operations = [], output = {}) => {
    const bitmap = await loadBitmap(source);
    let result = applyPipeline(bitmapToCanvas(bitmap), operations);
    result = fitCanvas(result, output);
    return canvasToBlob(result, output);
};
