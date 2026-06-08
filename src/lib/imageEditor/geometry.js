// Pure geometric helpers for the image editor pipeline. No DOM, no canvas:
// everything operates on plain numbers/arrays so it is fully unit-testable.

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Dimensions after `steps` clockwise 90-degree rotations (steps normalized to
// 0..3). Odd numbers of quarter-turns swap width and height.
export const rotateDimensions = (width, height, steps) => {
    const s = ((steps % 4) + 4) % 4;
    return s % 2 === 0 ? { width, height } : { width: height, height: width };
};

// Largest axis-aligned rectangle that still fits inside a width x height
// rectangle rotated by `angle` radians. Used to auto-crop the empty corners
// produced by free-angle straightening. Canonical "rotatedRectWithMaxArea".
export const rotatedRectWithMaxArea = (width, height, angle) => {
    if (width <= 0 || height <= 0) return { width: 0, height: 0 };

    const sinA = Math.abs(Math.sin(angle));
    const cosA = Math.abs(Math.cos(angle));
    const widthIsLonger = width >= height;
    const sideLong = widthIsLonger ? width : height;
    const sideShort = widthIsLonger ? height : width;

    // Half-constrained case: the crop touches the short side.
    if (sideShort <= 2 * sinA * cosA * sideLong || Math.abs(sinA - cosA) < 1e-10) {
        const x = 0.5 * sideShort;
        const wr = widthIsLonger ? x / Math.max(sinA, 1e-10) : x / Math.max(cosA, 1e-10);
        const hr = widthIsLonger ? x / Math.max(cosA, 1e-10) : x / Math.max(sinA, 1e-10);
        return { width: Math.min(wr, width), height: Math.min(hr, height) };
    }

    const cos2a = cosA * cosA - sinA * sinA;
    return {
        width: (width * cosA - height * sinA) / cos2a,
        height: (height * cosA - width * sinA) / cos2a,
    };
};

// Euclidean distance between two {x, y} points.
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Solve a dense linear system A x = b (n x n) by Gauss-Jordan elimination with
// partial pivoting. Returns the solution vector, or null if (near-)singular.
export const solveLinear = (A, b) => {
    const n = b.length;
    const m = A.map((row, i) => [...row, b[i]]);

    for (let col = 0; col < n; col++) {
        let pivot = col;
        for (let r = col + 1; r < n; r++) {
            if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
        }
        if (Math.abs(m[pivot][col]) < 1e-12) return null;
        [m[col], m[pivot]] = [m[pivot], m[col]];

        for (let r = 0; r < n; r++) {
            if (r === col) continue;
            const factor = m[r][col] / m[col][col];
            for (let c = col; c <= n; c++) m[r][c] -= factor * m[col][c];
        }
    }

    const x = new Array(n);
    for (let i = 0; i < n; i++) x[i] = m[i][n] / m[i][i];
    return x;
};

// 3x3 projective transform mapping 4 source points to 4 destination points
// (Direct Linear Transform). `src`/`dst` are arrays of 4 {x, y}. Returns the
// matrix as [[a,b,c],[d,e,f],[g,h,1]], or null if the points are degenerate.
export const getPerspectiveTransform = (src, dst) => {
    const A = [];
    const b = [];
    for (let i = 0; i < 4; i++) {
        const { x, y } = src[i];
        const { x: u, y: v } = dst[i];
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
        b.push(u);
        A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
        b.push(v);
    }
    const h = solveLinear(A, b);
    if (!h) return null;
    return [
        [h[0], h[1], h[2]],
        [h[3], h[4], h[5]],
        [h[6], h[7], 1],
    ];
};

// Apply a 3x3 homography to a point, returning the dehomogenized {x, y}.
export const applyMatrix = (matrix, x, y) => {
    const w = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2];
    return {
        x: (matrix[0][0] * x + matrix[0][1] * y + matrix[0][2]) / w,
        y: (matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]) / w,
    };
};

// Invert a 3x3 matrix (cofactor method). Returns null if (near-)singular.
export const invert3x3 = (matrix) => {
    const a = matrix[0][0], b = matrix[0][1], c = matrix[0][2];
    const d = matrix[1][0], e = matrix[1][1], f = matrix[1][2];
    const g = matrix[2][0], h = matrix[2][1], i = matrix[2][2];

    const A = e * i - f * h;
    const B = -(d * i - f * g);
    const C = d * h - e * g;
    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-12) return null;

    const inv = 1 / det;
    return [
        [A * inv, (c * h - b * i) * inv, (b * f - c * e) * inv],
        [B * inv, (a * i - c * g) * inv, (c * d - a * f) * inv],
        [C * inv, (b * g - a * h) * inv, (a * e - b * d) * inv],
    ];
};
