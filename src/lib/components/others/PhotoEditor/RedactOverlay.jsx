import { useRef, useState } from "react";
import PropTypes from "prop-types";

// Interactive redaction overlay rendered over the preview. Committed
// rectangles are baked into the preview canvas by the redact pipeline op;
// this overlay only tracks the rectangle being drawn. Pointer positions are
// converted to normalized coordinates against the displayed image box, the
// same way CropOverlay does.

export const RedactOverlay = ({ onAdd, disabled }) => {
    const hostRef = useRef(null);
    const [draft, setDraft] = useState(null);

    const toNormalized = (e) => {
        const host = hostRef.current?.parentElement;
        if (!host) return { x: 0, y: 0 };
        const box = host.getBoundingClientRect();
        const clamp = (v) => Math.min(Math.max(v, 0), 1);
        return {
            x: box.width ? clamp((e.clientX - box.left) / box.width) : 0,
            y: box.height ? clamp((e.clientY - box.top) / box.height) : 0,
        };
    };

    const onPointerDown = (e) => {
        if (disabled) return;
        e.preventDefault();
        const { x, y } = toNormalized(e);
        setDraft({ startX: x, startY: y, x, y, w: 0, h: 0 });
    };

    const onPointerMove = (e) => {
        if (!draft) return;
        const { x, y } = toNormalized(e);
        setDraft({
            ...draft,
            x: Math.min(draft.startX, x),
            y: Math.min(draft.startY, y),
            w: Math.abs(x - draft.startX),
            h: Math.abs(y - draft.startY),
        });
    };

    const endDrag = () => {
        if (!draft) return;
        // Ignore tiny accidental taps (below 1% of the image).
        if (draft.w > 0.01 && draft.h > 0.01) {
            onAdd({ x: draft.x, y: draft.y, w: draft.w, h: draft.h });
        }
        setDraft(null);
    };

    const pct = (v) => `${v * 100}%`;

    return (
        <div
            ref={hostRef}
            data-component="PhotoEditorRedactOverlay"
            className="absolute inset-0 touch-none select-none cursor-crosshair"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            {draft && (
                <div
                    data-testid="redact-draft"
                    className="absolute bg-black/60 border border-dashed border-white/90"
                    style={{
                        left: pct(draft.x),
                        top: pct(draft.y),
                        width: pct(draft.w),
                        height: pct(draft.h),
                    }}
                />
            )}
        </div>
    );
};

RedactOverlay.propTypes = {
    onAdd: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};
