import { useRef } from "react";
import PropTypes from "prop-types";

import { moveRect, resizeRectFromHandle, clampRect } from "./cropGeometry";

const HANDLES = ["nw", "ne", "sw", "se"];

// Interactive crop frame rendered over the preview. Works in normalized
// coordinates: it reads its own bounding box to convert pointer pixel deltas
// into 0..1 deltas, then delegates the maths to cropGeometry.
export const CropOverlay = ({ rect, onChange, disabled }) => {
    const frameRef = useRef(null);
    const dragRef = useRef(null);

    // Convert a movement in client pixels to a normalized delta using the
    // overlay's rendered size.
    const toNormalizedDelta = (dxPx, dyPx) => {
        const host = frameRef.current?.parentElement;
        if (!host) return { dx: 0, dy: 0 };
        const box = host.getBoundingClientRect();
        return {
            dx: box.width ? dxPx / box.width : 0,
            dy: box.height ? dyPx / box.height : 0,
        };
    };

    const startDrag = (mode, handle) => (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        dragRef.current = { mode, handle, lastX: e.clientX, lastY: e.clientY };
    };

    const onPointerMove = (e) => {
        const drag = dragRef.current;
        if (!drag) return;
        const { dx, dy } = toNormalizedDelta(e.clientX - drag.lastX, e.clientY - drag.lastY);
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        if (drag.mode === "move") {
            onChange(moveRect(rect, dx, dy));
        } else {
            onChange(clampRect(resizeRectFromHandle(rect, drag.handle, dx, dy)));
        }
    };

    const endDrag = (e) => {
        if (!dragRef.current) return;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        dragRef.current = null;
    };

    const pct = (v) => `${v * 100}%`;

    return (
        <div
            ref={frameRef}
            data-component="PhotoEditorCropOverlay"
            className="absolute inset-0 touch-none select-none"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            {/* darken everything outside the crop frame */}
            <div
                className="absolute inset-0"
                style={{
                    pointerEvents: "none",
                    background: "rgba(0,0,0,0.5)",
                    clipPath: `polygon(
                        0% 0%, 0% 100%, ${pct(rect.x)} 100%,
                        ${pct(rect.x)} ${pct(rect.y)},
                        ${pct(rect.x + rect.w)} ${pct(rect.y)},
                        ${pct(rect.x + rect.w)} ${pct(rect.y + rect.h)},
                        ${pct(rect.x)} ${pct(rect.y + rect.h)},
                        ${pct(rect.x)} 100%, 100% 100%, 100% 0%
                    )`,
                }}
            />

            {/* movable frame */}
            <div
                role="group"
                aria-label="crop area"
                onPointerDown={startDrag("move")}
                className="absolute border-2 border-white/90 cursor-move"
                style={{
                    left: pct(rect.x),
                    top: pct(rect.y),
                    width: pct(rect.w),
                    height: pct(rect.h),
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
                }}
            >
                {HANDLES.map((handle) => (
                    <button
                        key={handle}
                        type="button"
                        aria-label={`crop-handle-${handle}`}
                        onPointerDown={startDrag("resize", handle)}
                        className="absolute size-5 -m-2.5 rounded-full bg-white border border-black/30"
                        style={{
                            left: handle.includes("w") ? 0 : "100%",
                            top: handle.includes("n") ? 0 : "100%",
                            touchAction: "none",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

CropOverlay.propTypes = {
    rect: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        w: PropTypes.number,
        h: PropTypes.number,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};
