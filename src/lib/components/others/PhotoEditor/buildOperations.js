// Pure mapping from the editor's tool state to the engine's operation list.
// Kept separate so it can be unit-tested without mounting the component.

import { isFullRect } from "./cropGeometry";
import { isDefaultCorners } from "./perspectiveGeometry";

export const buildOperations = ({
    rotateSteps = 0,
    straightenAngle = 0,
    flipH = false,
    flipV = false,
    perspective = null,
    crop = null,
    autoEnhance = false,
    adjust = null,
    colorMode = "none",
} = {}) => {
    const ops = [];

    if (((rotateSteps % 4) + 4) % 4 !== 0) {
        ops.push({ type: "rotate90", steps: rotateSteps });
    }
    if (straightenAngle) {
        ops.push({ type: "straighten", angle: straightenAngle });
    }
    if (flipH || flipV) {
        ops.push({ type: "flip", flipH, flipV });
    }
    if (perspective?.corners && !isDefaultCorners(perspective.corners)) {
        ops.push({ type: "perspective", corners: perspective.corners });
    }
    if (crop && !isFullRect(crop)) {
        ops.push({ type: "crop", rect: crop });
    }
    if (autoEnhance) {
        ops.push({ type: "autoEnhance" });
    }
    const a = adjust ?? {};
    if (a.brightness || a.contrast || a.saturation || a.temperature) {
        ops.push({
            type: "adjust",
            brightness: a.brightness ?? 0,
            contrast: a.contrast ?? 0,
            saturation: a.saturation ?? 0,
            temperature: a.temperature ?? 0,
        });
    }
    // Grayscale and the document "scan" preset reuse the same engine op; the
    // only difference is whether the Otsu binarization is applied.
    if (colorMode === "grayscale") {
        ops.push({ type: "scan", binarize: false });
    } else if (colorMode === "scan") {
        ops.push({ type: "scan", binarize: true });
    }

    return ops;
};
