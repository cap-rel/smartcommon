import { useEffect, useRef, useState, useCallback } from "react";
import {
    FaRotateLeft,
    FaRotateRight,
    FaArrowsLeftRight,
    FaArrowsUpDown,
    FaCrop,
    FaVectorSquare,
    FaRulerHorizontal,
    FaXmark,
    FaCheck,
} from "react-icons/fa6";

import { twMerge, createLogger } from "lib/utils";
import {
    loadBitmap,
    bitmapToCanvas,
    fitCanvas,
    applyPipeline,
    applyImageEdits,
} from "lib/imageEditor";

import { propTypes, defaultProps, DEFAULT_LABELS } from "./props";
import { buildOperations } from "./buildOperations";
import { FULL_RECT, rectForAspect } from "./cropGeometry";
import { DEFAULT_CORNERS } from "./perspectiveGeometry";
import { CropOverlay } from "./CropOverlay";
import { PerspectiveTool } from "./PerspectiveTool";

const log = createLogger("PhotoEditor");

const initialState = {
    rotateSteps: 0,
    straightenAngle: 0,
    flipH: false,
    flipV: false,
    perspective: null,
    crop: null,
};

export const PhotoEditor = (props) => {
    const {
        open,
        src,
        onSave,
        onCancel,
        onError,
        tools,
        aspectRatios,
        maxStraightenAngle,
        output,
        previewMaxDimension,
        labels: userLabels,
        containerProps,
        headerProps,
        titleProps,
        canvasAreaProps,
        toolbarProps,
        footerProps,
    } = { ...defaultProps, ...props };

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const [state, setState] = useState(initialState);
    const [activeTool, setActiveTool] = useState(null);
    const [displayedSize, setDisplayedSize] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const workingRef = useRef(null);
    const displayCanvasRef = useRef(null);

    const setField = (patch) => setState((prev) => ({ ...prev, ...patch }));

    // Render the preview = every operation baked EXCEPT the overlay tool the
    // user is currently editing (crop / perspective), which is drawn as a live
    // overlay in the same coordinate space instead.
    const renderPreview = useCallback((current, active) => {
        const working = workingRef.current;
        if (!working) return;

        const ops = buildOperations(current).filter(
            (op) =>
                !(active === "crop" && op.type === "crop") &&
                !(active === "perspective" && op.type === "perspective")
        );
        const result = applyPipeline(working, ops);
        setDisplayedSize({ width: result.width, height: result.height });

        const canvas = displayCanvasRef.current;
        const ctx = canvas?.getContext?.("2d");
        if (!ctx) {
            log.warning("renderPreview: no 2D context, skipped paint");
            return;
        }
        canvas.width = result.width;
        canvas.height = result.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(result, 0, 0);
    }, []);

    // ----- load + downscale the source once ----------------------------------
    useEffect(() => {
        if (!open || !src) return;
        let cancelled = false;
        setError(null);
        setState(initialState);
        setActiveTool(null);

        (async () => {
            try {
                const bitmap = await loadBitmap(src);
                if (cancelled) return;
                const working = fitCanvas(bitmapToCanvas(bitmap), {
                    maxWidth: previewMaxDimension,
                    maxHeight: previewMaxDimension,
                });
                workingRef.current = working;
                renderPreview(initialState, null);
            } catch (err) {
                if (cancelled) return;
                log.error("Failed to load source image", err);
                setError(labels.loadError);
                onError?.(err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, src, previewMaxDimension]);

    // Repaint when a baked geometry tool changes, or when switching the active
    // overlay tool (which moves an op between "baked" and "overlay"). The crop
    // and perspective VALUES only change while their tool is active, i.e. shown
    // as an overlay, so they never need to trigger a repaint here.
    useEffect(() => {
        renderPreview(state, activeTool);
    }, [state.rotateSteps, state.straightenAngle, state.flipH, state.flipV, activeTool]);

    // ----- tool actions ------------------------------------------------------
    const rotate = (dir) =>
        setField({ rotateSteps: (((state.rotateSteps + dir) % 4) + 4) % 4 });

    const pickRatio = (ratio) => {
        if (ratio.value === null) {
            setField({ crop: { ...FULL_RECT } });
            return;
        }
        if (ratio.value === "original") {
            setField({ crop: { ...FULL_RECT } });
            return;
        }
        const base = displayedSize ?? { width: 1, height: 1 };
        setField({ crop: rectForAspect(ratio.value, base.width, base.height) });
    };

    const toggleTool = (tool) => {
        setActiveTool((prev) => (prev === tool ? null : tool));
        if (tool === "crop" && !state.crop) setField({ crop: { ...FULL_RECT } });
        if (tool === "perspective" && !state.perspective) {
            setField({ perspective: { corners: DEFAULT_CORNERS.map((c) => ({ ...c })) } });
        }
    };

    const reset = () => {
        setState(initialState);
        setActiveTool(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const operations = buildOperations(state);
            const blob = await applyImageEdits(src, operations, output);
            onSave?.(blob, { operations });
        } catch (err) {
            log.error("Failed to export edited image", err);
            setError(labels.saveError);
            onError?.(err);
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const toolButton = (key, icon, label, onClick, active) => (
        <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={active ? "true" : undefined}
            onClick={onClick}
            className={twMerge(
                "flex flex-col items-center justify-center gap-app-xxs p-app-sm rounded-app-md text-app-xl",
                "text-soft-text cursor-pointer duration-(--quick)",
                active ? "bg-primary/15 text-primary" : "active:brightness-soft"
            )}
        >
            {icon}
        </button>
    );

    const Icon = {
        rotateLeft: <FaRotateLeft />,
        rotateRight: <FaRotateRight />,
        flipH: <FaArrowsLeftRight />,
        flipV: <FaArrowsUpDown />,
        crop: <FaCrop />,
        perspective: <FaVectorSquare />,
        straighten: <FaRulerHorizontal />,
    };

    return (
        <div
            data-component="PhotoEditor"
            {...containerProps}
            className={twMerge(
                "fixed inset-0 z-50 flex flex-col bg-black text-white",
                containerProps?.className
            )}
        >
            {/* header */}
            <div
                {...headerProps}
                className={twMerge(
                    "flex items-center justify-between gap-app-sm px-app-base py-app-sm bg-black/80",
                    headerProps?.className
                )}
            >
                <button
                    type="button"
                    aria-label={labels.cancel}
                    onClick={onCancel}
                    className="text-app-xl p-app-xs cursor-pointer"
                >
                    <FaXmark />
                </button>
                <div
                    {...titleProps}
                    className={twMerge("font-app-semibold", titleProps?.className)}
                >
                    {labels.title}
                </div>
                <button
                    type="button"
                    aria-label={labels.save}
                    onClick={handleSave}
                    disabled={saving}
                    className="text-app-xl p-app-xs cursor-pointer disabled:brightness-soft text-primary"
                >
                    <FaCheck />
                </button>
            </div>

            {error && (
                <div className="px-app-base py-app-xs bg-error text-white text-app-sm" role="alert">
                    {error}
                </div>
            )}

            {/* canvas area */}
            <div
                {...canvasAreaProps}
                className={twMerge(
                    "relative flex-1 min-h-0 flex items-center justify-center overflow-hidden p-app-sm",
                    canvasAreaProps?.className
                )}
            >
                <div className="relative max-w-full max-h-full inline-block">
                    <canvas
                        ref={displayCanvasRef}
                        data-testid="photo-editor-canvas"
                        className="max-w-full max-h-full object-contain block"
                    />
                    {activeTool === "crop" && state.crop && (
                        <CropOverlay
                            rect={state.crop}
                            onChange={(rect) => setField({ crop: rect })}
                        />
                    )}
                    {activeTool === "perspective" && state.perspective && (
                        <PerspectiveTool
                            corners={state.perspective.corners}
                            onChange={(corners) => setField({ perspective: { corners } })}
                        />
                    )}
                </div>
            </div>

            {/* straighten panel */}
            {activeTool === "straighten" && (
                <div className="px-app-base py-app-sm bg-black/80 flex items-center gap-app-sm">
                    <span className="text-app-sm w-12 text-right tabular-nums">
                        {state.straightenAngle}&deg;
                    </span>
                    <input
                        type="range"
                        aria-label={labels.straighten}
                        min={-maxStraightenAngle}
                        max={maxStraightenAngle}
                        step={1}
                        value={state.straightenAngle}
                        onChange={(e) => setField({ straightenAngle: Number(e.target.value) })}
                        className="flex-1 accent-primary"
                    />
                </div>
            )}

            {/* crop ratio chips */}
            {activeTool === "crop" && (
                <div className="px-app-base py-app-sm bg-black/80 flex gap-app-xs overflow-x-auto">
                    {aspectRatios.map((ratio) => (
                        <button
                            key={ratio.key}
                            type="button"
                            onClick={() => pickRatio(ratio)}
                            className="shrink-0 px-app-sm py-app-xxs rounded-app-md border border-white/30 text-app-sm cursor-pointer active:brightness-soft"
                        >
                            {ratio.label ??
                                (ratio.value === "original" ? labels.ratioOriginal : labels.ratioFree)}
                        </button>
                    ))}
                </div>
            )}

            {/* toolbar */}
            <div
                {...toolbarProps}
                className={twMerge(
                    "flex items-center justify-around gap-app-xs px-app-base py-app-sm bg-black/90",
                    toolbarProps?.className
                )}
            >
                {tools.includes("crop") &&
                    toolButton("crop", Icon.crop, labels.crop, () => toggleTool("crop"), activeTool === "crop")}
                {tools.includes("perspective") &&
                    toolButton(
                        "perspective",
                        Icon.perspective,
                        labels.perspective,
                        () => toggleTool("perspective"),
                        activeTool === "perspective"
                    )}
                {tools.includes("rotate") &&
                    toolButton("rotateLeft", Icon.rotateLeft, labels.rotateLeft, () => rotate(-1))}
                {tools.includes("rotate") &&
                    toolButton("rotateRight", Icon.rotateRight, labels.rotateRight, () => rotate(1))}
                {tools.includes("flip") &&
                    toolButton(
                        "flipH",
                        Icon.flipH,
                        labels.flipHorizontal,
                        () => setField({ flipH: !state.flipH }),
                        state.flipH
                    )}
                {tools.includes("flip") &&
                    toolButton(
                        "flipV",
                        Icon.flipV,
                        labels.flipVertical,
                        () => setField({ flipV: !state.flipV }),
                        state.flipV
                    )}
                {tools.includes("straighten") &&
                    toolButton(
                        "straighten",
                        Icon.straighten,
                        labels.straighten,
                        () => toggleTool("straighten"),
                        activeTool === "straighten"
                    )}
            </div>

            {/* footer */}
            <div
                {...footerProps}
                className={twMerge(
                    "flex items-center justify-between gap-app-sm px-app-base py-app-sm bg-black",
                    footerProps?.className
                )}
            >
                <button
                    type="button"
                    onClick={reset}
                    className="px-app-md py-app-sm rounded-app-md border border-white/30 text-app-sm cursor-pointer active:brightness-soft"
                >
                    {labels.reset}
                </button>
                <div className="flex gap-app-sm">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-app-md py-app-sm rounded-app-md border border-white/30 text-app-sm cursor-pointer active:brightness-soft"
                    >
                        {labels.cancel}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-app-md py-app-sm rounded-app-md bg-primary text-white text-app-sm font-app-semibold cursor-pointer disabled:brightness-soft"
                    >
                        {saving ? labels.saving : labels.save}
                    </button>
                </div>
            </div>
        </div>
    );
};

PhotoEditor.propTypes = propTypes;
