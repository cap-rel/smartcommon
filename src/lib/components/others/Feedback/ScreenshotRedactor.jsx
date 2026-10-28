import { useRef, useEffect, useState, useCallback } from "react";
import { FaCheck, FaXmark, FaRotateLeft } from "react-icons/fa6";

import { createLogger } from "lib/utils";

const log = createLogger("ScreenshotRedactor");

// Simple redaction tool: draws opaque black rectangles over the image.
// The output is a new File with the redactions baked in; the original
// screenshot is never modified.
//
// Pointer events unify mouse + touch: pointerdown starts a rectangle,
// pointermove resizes it, pointerup commits it.

/**
 * @param {Object} props
 * @param {string} props.imageUrl - Blob/object URL of the screenshot
 * @param {string} props.imageType - MIME type of the source image
 * @param {function(File): void} props.onDone - Called with the redacted File
 * @param {function(): void} props.onCancel - Called when the user cancels
 * @param {Object} props.labels - Text overrides
 */
export const ScreenshotRedactor = (props) => {
    const { imageUrl, imageType = "image/png", onDone, onCancel } = props;
    const labels = props.labels ?? {};

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [rects, setRects] = useState([]); // committed rectangles in image coords
    const [current, setCurrent] = useState(null); // rectangle being drawn
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageRef = useRef(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    // Load the image and size the canvas to fit the container.
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
            setImageLoaded(true);
        };
        img.onerror = () => log.error("failed to load screenshot for redaction");
        img.src = imageUrl;
    }, [imageUrl]);

    // Redraw: image + all committed rectangles + the one being drawn.
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#000000";
        for (const r of rects) {
            ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        if (current) {
            ctx.fillRect(current.x, current.y, current.w, current.h);
        }
    }, [rects, current]);

    // Size the canvas to the image aspect ratio, bounded by the container.
    useEffect(() => {
        if (!imageLoaded || !containerRef.current || !canvasRef.current) return;

        const container = containerRef.current;
        const maxW = container.clientWidth;
        const maxH = Math.min(container.clientHeight || 400, 400);
        const scale = Math.min(maxW / imageSize.width, maxH / imageSize.height, 1);

        const canvas = canvasRef.current;
        canvas.width = Math.round(imageSize.width * scale);
        canvas.height = Math.round(imageSize.height * scale);

        redraw();
    }, [imageLoaded, imageSize, redraw]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    // Convert a pointer event position to image coordinates.
    const toImageCoords = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }, []);

    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        const { x, y } = toImageCoords(e);
        setCurrent({ x, y, w: 0, h: 0, startX: x, startY: y });
    }, [toImageCoords]);

    const handlePointerMove = useCallback((e) => {
        if (!current) return;
        const { x, y } = toImageCoords(e);
        setCurrent(prev => prev ? {
            ...prev,
            x: Math.min(prev.startX, x),
            y: Math.min(prev.startY, y),
            w: Math.abs(x - prev.startX),
            h: Math.abs(y - prev.startY),
        } : null);
    }, [current, toImageCoords]);

    const handlePointerUp = useCallback(() => {
        if (!current) return;
        // Ignore tiny accidental drags.
        if (current.w > 5 && current.h > 5) {
            setRects(prev => [...prev, { x: current.x, y: current.y, w: current.w, h: current.h }]);
        }
        setCurrent(null);
    }, [current]);

    const handleUndo = useCallback(() => {
        setRects(prev => prev.slice(0, -1));
    }, []);

    const handleDone = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) {
                log.error("canvas toBlob failed during redaction export");
                return;
            }
            const file = new File([blob], `redacted-${Date.now()}.png`, { type: "image/png" });
            onDone?.(file);
        }, "image/png");
    }, [onDone]);

    return (
        <div className="flex flex-col gap-3" data-component="ScreenshotRedactor">
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
                style={{ minHeight: 200 }}
            >
                <canvas
                    ref={canvasRef}
                    className="block w-full touch-none cursor-crosshair"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    aria-label={labels.redactLabel ?? "Redact an area"}
                    role="img"
                />
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        ...
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500">
                {labels.redactHelp ?? "Draw a black rectangle over any sensitive area."}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleUndo}
                    disabled={rects.length === 0}
                    className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                    <FaRotateLeft />
                    {labels.undoLabel ?? "Undo"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    <FaXmark />
                    {labels.cancelLabel ?? "Cancel"}
                </button>
                <button
                    type="button"
                    onClick={handleDone}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    <FaCheck />
                    {labels.applyLabel ?? "Apply"}
                </button>
            </div>
        </div>
    );
};
