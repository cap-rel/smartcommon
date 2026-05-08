import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "lib/utils";

import { useImageUrl, getTouchDistance, clientToPercent, clamp } from "./helpers";

// Renders the image inside a zoomable / pannable container, plus the marker
// overlay. Handles all pointer interactions:
// - long press on background -> onLongPressBackground(x%, y%)
// - long press on marker     -> drag start
// - drag                     -> pos updated locally; final x/y emitted on pointer up
// - tap on marker            -> onMarkerClick(annotation)
// - pinch / wheel            -> zoom
// - pan when zoomed > 1      -> translate
export const ImageCanvas = ({
    src,
    annotations,
    annotationTypes,
    selectedId,
    readOnly,
    longPressMs,
    minZoom,
    maxZoom,
    onLongPressBackground,
    onMarkerClick,
    onMarkerDoubleClick,
    onAnnotationDragEnd,
    zoom,
    onZoomChange,
    translate,
    onTranslateChange,
    imageContainerProps = {},
    markerProps = {},
}) => {
    const url = useImageUrl(src);

    const containerRef = useRef(null);
    const imageBoxRef = useRef(null);

    // Pinch state
    const lastPinchRef = useRef(null);
    const lastPanRef = useRef(null);
    const panActiveRef = useRef(false);
    const tapStartRef = useRef(null);

    // Long-press background timer
    const bgLongPressTimer = useRef(null);
    const bgLongPressPos = useRef(null);

    // Drag state for the marker currently being moved.
    const [draggingId, setDraggingId] = useState(null);
    const draggingPosRef = useRef(null);

    // Last-tap tracker for double-click on markers (works on touch + mouse).
    const lastMarkerTap = useRef({ id: null, t: 0 });

    // Keep a per-render copy of annotations so the active drag preview can
    // diverge from the prop array until pointer up.
    const annotationsToRender = annotations.map((a) =>
        a.id === draggingId && draggingPosRef.current
            ? { ...a, x: draggingPosRef.current.x, y: draggingPosRef.current.y }
            : a
    );

    const cancelBackgroundLongPress = () => {
        if (bgLongPressTimer.current) {
            clearTimeout(bgLongPressTimer.current);
            bgLongPressTimer.current = null;
        }
    };

    // -------- wheel zoom (passive: false to allow preventDefault) --------
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;
        const handler = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            onZoomChange((z) => clamp(z * delta, minZoom, maxZoom));
        };
        el.addEventListener("wheel", handler, { passive: false });
        return () => el.removeEventListener("wheel", handler);
    }, [onZoomChange, minZoom, maxZoom]);

    // -------- pointer-up resolves drag end / cleans up tap state ---------
    useEffect(() => {
        const onPointerUp = () => {
            if (draggingId && draggingPosRef.current) {
                onAnnotationDragEnd(draggingId, draggingPosRef.current);
            }
            setDraggingId(null);
            draggingPosRef.current = null;
            cancelBackgroundLongPress();
            lastPinchRef.current = null;
            lastPanRef.current = null;
            panActiveRef.current = false;
            tapStartRef.current = null;
        };
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
        return () => {
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
        };
    }, [draggingId, onAnnotationDragEnd]);

    // -------- pointer move for drag and pan ------------------------------
    useEffect(() => {
        const onPointerMove = (e) => {
            if (draggingId) {
                const rect = imageBoxRef.current?.getBoundingClientRect();
                if (!rect) return;
                const { x, y } = clientToPercent(e.clientX, e.clientY, rect);
                draggingPosRef.current = { x, y };
                // Force a re-render via state so the marker visually follows.
                setDraggingId((id) => id);
                return;
            }
            if (panActiveRef.current && lastPanRef.current && zoom > 1) {
                const dx = e.clientX - lastPanRef.current.x;
                const dy = e.clientY - lastPanRef.current.y;
                onTranslateChange((t) => ({ x: t.x + dx, y: t.y + dy }));
                lastPanRef.current = { x: e.clientX, y: e.clientY };
            }
        };
        window.addEventListener("pointermove", onPointerMove);
        return () => window.removeEventListener("pointermove", onPointerMove);
    }, [draggingId, zoom, onTranslateChange]);

    // -------- background long-press -> open type picker at this position --
    const handleImagePointerDown = useCallback((e) => {
        if (readOnly) return;
        // Only react to the underlying image, not to children (markers).
        if (e.target !== e.currentTarget) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        cancelBackgroundLongPress();
        const startX = e.clientX;
        const startY = e.clientY;
        bgLongPressPos.current = { x: startX, y: startY };
        tapStartRef.current = { x: startX, y: startY };
        lastPanRef.current = { x: startX, y: startY };
        panActiveRef.current = false;

        bgLongPressTimer.current = setTimeout(() => {
            bgLongPressTimer.current = null;
            const rect = imageBoxRef.current?.getBoundingClientRect();
            if (!rect) return;
            const { x, y } = clientToPercent(startX, startY, rect);
            onLongPressBackground(x, y);
        }, longPressMs);
    }, [readOnly, longPressMs, onLongPressBackground]);

    const handleImagePointerMove = useCallback((e) => {
        if (bgLongPressTimer.current && bgLongPressPos.current) {
            const dx = Math.abs(e.clientX - bgLongPressPos.current.x);
            const dy = Math.abs(e.clientY - bgLongPressPos.current.y);
            if (dx > 10 || dy > 10) {
                cancelBackgroundLongPress();
                if (zoom > 1) panActiveRef.current = true;
            }
        }
    }, [zoom]);

    // -------- pinch (touch only, container-level) -------------------------
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            lastPinchRef.current = getTouchDistance(e.touches);
            cancelBackgroundLongPress();
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = getTouchDistance(e.touches);
            if (lastPinchRef.current) {
                const ratio = dist / lastPinchRef.current;
                onZoomChange((z) => clamp(z * ratio, minZoom, maxZoom));
            }
            lastPinchRef.current = dist;
        }
    }, [onZoomChange, minZoom, maxZoom]);

    // -------- marker pointer handlers (delegated, see overlay below) -----
    const handleMarkerPointerDown = (annotation) => (e) => {
        e.stopPropagation();
        if (readOnly) {
            onMarkerClick(annotation);
            return;
        }
        // Long press on marker -> drag mode.
        let downTimer = setTimeout(() => {
            downTimer = null;
            setDraggingId(annotation.id);
            draggingPosRef.current = { x: annotation.x, y: annotation.y };
        }, longPressMs);

        const cancelMarkerLongPress = () => {
            if (downTimer) { clearTimeout(downTimer); downTimer = null; }
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        const onMove = (ev) => {
            const dx = Math.abs(ev.clientX - e.clientX);
            const dy = Math.abs(ev.clientY - e.clientY);
            if (dx > 10 || dy > 10) cancelMarkerLongPress();
        };

        const onUp = () => {
            cancelMarkerLongPress();
            // If we never entered drag mode, this is a tap -> select.
            // Detect double-tap (same id within 350ms) -> activate.
            const now = Date.now();
            const last = lastMarkerTap.current;
            if (last.id === annotation.id && now - last.t < 350) {
                onMarkerDoubleClick?.(annotation);
                lastMarkerTap.current = { id: null, t: 0 };
            } else {
                onMarkerClick(annotation);
                lastMarkerTap.current = { id: annotation.id, t: now };
            }
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
    };

    return (
        <div
            ref={containerRef}
            {...imageContainerProps}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className={twMerge(
                "relative flex-1 overflow-hidden bg-black select-none touch-none",
                imageContainerProps.className
            )}
        >
            <div
                ref={imageBoxRef}
                style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: draggingId ? "none" : "transform 100ms ease-out",
                }}
                className="relative w-full h-full flex items-center justify-center"
            >
                {url && (
                    <img
                        src={url}
                        alt=""
                        draggable={false}
                        onPointerDown={handleImagePointerDown}
                        onPointerMove={handleImagePointerMove}
                        className="max-w-full max-h-full object-contain pointer-events-auto"
                    />
                )}

                {/* Marker overlay - positioned relative to the image box */}
                <div className="absolute inset-0 pointer-events-none">
                    {annotationsToRender.map((annotation, index) => {
                        const def = annotationTypes[annotation.type];
                        if (!def) return null;
                        const ctx = {
                            num: index + 1,
                            selected: annotation.id === selectedId,
                            dragging: annotation.id === draggingId,
                            readOnly,
                        };
                        return (
                            <button
                                key={annotation.id}
                                type="button"
                                onPointerDown={handleMarkerPointerDown(annotation)}
                                {...markerProps}
                                style={{
                                    left: `${annotation.x}%`,
                                    top: `${annotation.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    ...(markerProps.style || {}),
                                }}
                                className={twMerge(
                                    "absolute pointer-events-auto cursor-grab active:cursor-grabbing",
                                    ctx.selected && "ring-2 ring-white ring-offset-1 ring-offset-black/30 rounded-full",
                                    markerProps.className
                                )}
                            >
                                {def.renderMarker(annotation, ctx)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
