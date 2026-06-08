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

    return ops;
};
