// Pure pixel-level helpers operating on { data, width, height } objects (the
// shape of a canvas ImageData). No canvas access here, so they are fully
// unit-testable with a plain typed array.

// Rec. 601 luma of an RGB triple.
export const toGrayValue = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

// Single-channel grayscale array (length width*height) from RGBA image data.
export const grayscaleArray = ({ data, width, height }) => {
    const out = new Uint8ClampedArray(width * height);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        out[p] = toGrayValue(data[i], data[i + 1], data[i + 2]);
    }
    return out;
};

// Otsu automatic threshold on a single-channel array. Returns the 0..255 cut
// that maximizes inter-class variance. Empty input returns 0.
export const otsuThreshold = (gray) => {
    if (!gray || gray.length === 0) return 0;

    const hist = new Array(256).fill(0);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

    const total = gray.length;
    let sumAll = 0;
    for (let t = 0; t < 256; t++) sumAll += t * hist[t];

    let sumBackground = 0;
    let weightBackground = 0;
    let maxVariance = -1;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
        weightBackground += hist[t];
        if (weightBackground === 0) continue;
        const weightForeground = total - weightBackground;
        if (weightForeground === 0) break;

        sumBackground += t * hist[t];
        const meanBackground = sumBackground / weightBackground;
        const meanForeground = (sumAll - sumBackground) / weightForeground;
        const between =
            weightBackground *
            weightForeground *
            (meanBackground - meanForeground) *
            (meanBackground - meanForeground);

        if (between > maxVariance) {
            maxVariance = between;
            threshold = t;
        }
    }

    return threshold;
};

// Auto-contrast bounds: the low/high luma values to stretch to [0,255]. A small
// `clip` fraction is trimmed from each tail so a few outlier pixels do not flatten
// the stretch. Returns { lo: 0, hi: 255 } (a no-op) for empty or flat input.
export const computeStretchBounds = (gray, clip = 0.005) => {
    if (!gray || gray.length === 0) return { lo: 0, hi: 255 };

    const hist = new Array(256).fill(0);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

    const clipCount = clip * gray.length;
    let lo = 0;
    let hi = 255;

    let acc = 0;
    for (let t = 0; t < 256; t++) {
        acc += hist[t];
        if (acc > clipCount) {
            lo = t;
            break;
        }
    }
    acc = 0;
    for (let t = 255; t >= 0; t--) {
        acc += hist[t];
        if (acc > clipCount) {
            hi = t;
            break;
        }
    }

    if (hi <= lo) return { lo: 0, hi: 255 };
    return { lo, hi };
};

// Build a CSS canvas `filter` string from normalized adjustment params, each in
// roughly -1..1 (0 = no change). Pure string builder so it can be asserted in
// tests without a canvas.
export const buildFilterString = ({
    brightness = 0,
    contrast = 0,
    saturation = 0,
    temperature = 0,
} = {}) => {
    const parts = [
        `brightness(${(1 + brightness).toFixed(3)})`,
        `contrast(${(1 + contrast).toFixed(3)})`,
        `saturate(${(1 + saturation).toFixed(3)})`,
    ];
    // Approximate warm/cool shift with a small hue rotation. Refined to true
    // channel-based white balance in a later lot if needed.
    if (temperature) parts.push(`hue-rotate(${(temperature * 20).toFixed(2)}deg)`);
    return parts.join(" ");
};
