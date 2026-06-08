// Thin canvas helpers shared by the image editor engine. Kept apart so the
// operations and the pipeline never duplicate the OffscreenCanvas/HTMLCanvas
// branching. Browser-only (canvas API), but framework-agnostic (no React).

// Create a blank drawing surface, preferring OffscreenCanvas when available
// (worker-safe, no DOM node) and falling back to a detached <canvas>.
export const createCanvas = (width, height) => {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(w, h);
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
};

// Downscale a canvas so it fits within maxWidth/maxHeight, preserving aspect
// ratio. Never upscales (returns the input untouched when already smaller).
export const fitCanvas = (canvas, { maxWidth, maxHeight } = {}) => {
    const { width, height } = canvas;
    let scale = 1;
    if (maxWidth) scale = Math.min(scale, maxWidth / width);
    if (maxHeight) scale = Math.min(scale, maxHeight / height);
    if (scale >= 1) return canvas;

    const out = createCanvas(width * scale, height * scale);
    out.getContext("2d").drawImage(canvas, 0, 0, out.width, out.height);
    return out;
};

// Encode a canvas to a Blob, handling both OffscreenCanvas.convertToBlob and
// HTMLCanvasElement.toBlob.
export const canvasToBlob = (canvas, { type = "image/jpeg", quality = 0.9 } = {}) => {
    if (typeof canvas.convertToBlob === "function") {
        return canvas.convertToBlob({ type, quality });
    }
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("imageEditor: toBlob returned null"))),
            type,
            quality
        );
    });
};
