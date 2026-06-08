import { useRef } from "react";
import PropTypes from "prop-types";

import { moveCorner } from "./perspectiveGeometry";

const LABELS = ["nw", "ne", "se", "sw"]; // TL, TR, BR, BL

// Draggable 4-corner quad drawn over the preview. Like CropOverlay it works in
// normalized coordinates, converting pointer pixel deltas to 0..1 via the
// host's bounding box, and delegates the maths to perspectiveGeometry.
export const PerspectiveTool = ({ corners, onChange, disabled }) => {
    const hostRef = useRef(null);
    const dragRef = useRef(null);

    const toNormalizedDelta = (dxPx, dyPx) => {
        const box = hostRef.current?.getBoundingClientRect();
        if (!box || !box.width || !box.height) return { dx: 0, dy: 0 };
        return { dx: dxPx / box.width, dy: dyPx / box.height };
    };

    const startDrag = (index) => (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        dragRef.current = { index, lastX: e.clientX, lastY: e.clientY };
    };

    const onPointerMove = (e) => {
        const drag = dragRef.current;
        if (!drag) return;
        const { dx, dy } = toNormalizedDelta(e.clientX - drag.lastX, e.clientY - drag.lastY);
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        onChange(moveCorner(corners, drag.index, dx, dy));
    };

    const endDrag = (e) => {
        if (!dragRef.current) return;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        dragRef.current = null;
    };

    const points = corners.map((c) => `${c.x * 100},${c.y * 100}`).join(" ");

    return (
        <div
            ref={hostRef}
            data-component="PhotoEditorPerspectiveTool"
            className="absolute inset-0 touch-none select-none"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <polygon
                    points={points}
                    fill="rgba(0,0,0,0.25)"
                    stroke="white"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {corners.map((c, index) => (
                <button
                    key={LABELS[index]}
                    type="button"
                    aria-label={`perspective-corner-${LABELS[index]}`}
                    onPointerDown={startDrag(index)}
                    className="absolute size-6 -m-3 rounded-full bg-white border-2 border-primary"
                    style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, touchAction: "none" }}
                />
            ))}
        </div>
    );
};

PerspectiveTool.propTypes = {
    corners: PropTypes.arrayOf(
        PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};
