import { useRef, useState } from "react";
import PropTypes from "prop-types";

// Interactive redaction overlay rendered over the preview. Committed
// rectangles are baked into the preview canvas by the redact pipeline op;
// this overlay only tracks the rectangle being drawn. Pointer positions are
// converted to normalized coordinates against the displayed image box, the
// same way CropOverlay does.
//
// Keyboard: the overlay is focusable. Arrow keys move a cursor, Enter or
// Space starts a rectangle at the cursor and commits it, Escape cancels the
// rectangle being drawn. Shift makes the arrows take bigger steps.

const STEP = 0.02;
const BIG_STEP = 0.1;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// The draft keeps the anchor (where the drag started) and the far corner;
// the normalized rect is derived from the two.
const normalizeDraft = (d) => ({
    x: Math.min(d.startX, d.curX),
    y: Math.min(d.startY, d.curY),
    w: Math.abs(d.curX - d.startX),
    h: Math.abs(d.curY - d.startY),
});

export const RedactOverlay = ({ onAdd, disabled, label, keyboardHelp }) => {
    const hostRef = useRef(null);
    const [draft, setDraft] = useState(null);
    const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });

    const toNormalized = (e) => {
        const host = hostRef.current?.parentElement;
        if (!host) return { x: 0, y: 0 };
        const box = host.getBoundingClientRect();
        return {
            x: box.width ? clamp01((e.clientX - box.left) / box.width) : 0,
            y: box.height ? clamp01((e.clientY - box.top) / box.height) : 0,
        };
    };

    const onPointerDown = (e) => {
        if (disabled) return;
        e.preventDefault();
        const { x, y } = toNormalized(e);
        setDraft({ startX: x, startY: y, curX: x, curY: y });
    };

    const onPointerMove = (e) => {
        if (!draft) return;
        const { x, y } = toNormalized(e);
        setDraft({ ...draft, curX: x, curY: y });
    };

    const endDrag = () => {
        if (!draft) return;
        // Ignore tiny accidental taps (below 1% of the image).
        const rect = normalizeDraft(draft);
        if (rect.w > 0.01 && rect.h > 0.01) {
            onAdd(rect);
        }
        setDraft(null);
    };

    const onKeyDown = (e) => {
        if (disabled) return;
        const isArrow = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key);
        const isValidate = e.key === "Enter" || e.key === " ";

        if (e.key === "Escape") {
            if (draft) {
                e.preventDefault();
                setDraft(null);
            }
            return;
        }
        if (isValidate) {
            e.preventDefault();
            if (draft) {
                endDrag();
            } else {
                setDraft({ startX: cursor.x, startY: cursor.y, curX: cursor.x, curY: cursor.y });
            }
            return;
        }
        if (!isArrow) return;
        e.preventDefault();
        const step = e.shiftKey ? BIG_STEP : STEP;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;

        if (draft) {
            setDraft((prev) => prev
                ? { ...prev, curX: clamp01(prev.curX + dx), curY: clamp01(prev.curY + dy) }
                : prev);
        } else {
            setCursor((prev) => ({ x: clamp01(prev.x + dx), y: clamp01(prev.y + dy) }));
        }
    };

    const pct = (v) => `${v * 100}%`;
    const rect = draft ? normalizeDraft(draft) : null;

    return (
        <div
            ref={hostRef}
            data-component="PhotoEditorRedactOverlay"
            className="absolute inset-0 touch-none select-none cursor-crosshair focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            tabIndex={disabled ? -1 : 0}
            role="group"
            aria-label={label ?? "Redact an area"}
            aria-describedby={keyboardHelp ? "redact-overlay-keyboard-help" : undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
        >
            {keyboardHelp && (
                <span id="redact-overlay-keyboard-help" className="sr-only">
                    {keyboardHelp}
                </span>
            )}
            {!draft && (
                <div
                    data-testid="redact-cursor"
                    className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: pct(cursor.x), top: pct(cursor.y) }}
                    aria-hidden="true"
                >
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white/90" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/90" />
                </div>
            )}
            {rect && (
                <div
                    data-testid="redact-draft"
                    className="absolute bg-black/60 border border-dashed border-white/90"
                    style={{
                        left: pct(rect.x),
                        top: pct(rect.y),
                        width: pct(rect.w),
                        height: pct(rect.h),
                    }}
                />
            )}
        </div>
    );
};

RedactOverlay.propTypes = {
    onAdd: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    label: PropTypes.string,
    keyboardHelp: PropTypes.string,
};
