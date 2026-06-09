// Lightweight, dependency-free document-edge detection. Tuned for the easy and
// common field case: a document/card sitting on a contrasted background. The
// hard cases (cluttered or low-contrast backgrounds) are intentionally left to
// an optional OpenCV/ML upgrade; here we stay pure and fast.
//
// Pipeline: grayscale -> Otsu threshold -> foreground mask (polarity inferred
// from the image border, assumed to be background) -> the four extreme corner
// points of that mask (min/max of x+y and x-y), which approximate a convex
// quadrilateral even when the document is rotated.
//
// Operates on a plain { data, width, height } (canvas ImageData shape), so it is
// fully unit-testable. Returns 4 normalized corners [TL, TR, BR, BL] in 0..1, or
// null when no confident document is found.

import { grayscaleArray, otsuThreshold } from "./pixels";

export const detectDocumentQuad = (image, options = {}) => {
    const { width, height } = image;
    if (!width || !height) return null;

    const { minAreaFraction = 0.02, fullFrameEpsilon = 0.02, step = 1 } = options;

    const gray = grayscaleArray(image);
    const threshold = otsuThreshold(gray);

    // Infer polarity from the border ring (assumed background): if the border is
    // mostly bright the document is the darker class, and vice versa. This makes
    // detection work for both light-on-dark and dark-on-light.
    let borderBright = 0;
    let borderCount = 0;
    const sampleBorder = (x, y) => {
        borderCount++;
        if (gray[y * width + x] > threshold) borderBright++;
    };
    for (let x = 0; x < width; x++) {
        sampleBorder(x, 0);
        sampleBorder(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        sampleBorder(0, y);
        sampleBorder(width - 1, y);
    }
    const borderMostlyBright = borderBright * 2 > borderCount;
    const isForeground = (v) => (borderMostlyBright ? v <= threshold : v > threshold);

    let minSum = Infinity;
    let maxSum = -Infinity;
    let maxDiff = -Infinity;
    let minDiff = Infinity;
    let tl;
    let tr;
    let br;
    let bl;
    let count = 0;

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            if (!isForeground(gray[y * width + x])) continue;
            count++;
            const sum = x + y;
            const diff = x - y;
            if (sum < minSum) {
                minSum = sum;
                tl = { x, y };
            }
            if (sum > maxSum) {
                maxSum = sum;
                br = { x, y };
            }
            if (diff > maxDiff) {
                maxDiff = diff;
                tr = { x, y };
            }
            if (diff < minDiff) {
                minDiff = diff;
                bl = { x, y };
            }
        }
    }

    const sampledArea = Math.ceil(width / step) * Math.ceil(height / step);
    if (!tl || count < minAreaFraction * sampledArea) return null;

    const denomX = width - 1 || 1;
    const denomY = height - 1 || 1;
    const norm = (p) => ({ x: p.x / denomX, y: p.y / denomY });
    const corners = [norm(tl), norm(tr), norm(br), norm(bl)];

    // If the quad already hugs the image corners there is nothing to rectify.
    const imageCorners = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
    ];
    const isFullFrame = corners.every(
        (c, i) =>
            Math.abs(c.x - imageCorners[i].x) <= fullFrameEpsilon &&
            Math.abs(c.y - imageCorners[i].y) <= fullFrameEpsilon
    );
    if (isFullFrame) return null;

    return corners;
};
