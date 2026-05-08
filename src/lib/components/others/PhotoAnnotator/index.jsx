import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlus, FaMagnifyingGlassMinus } from "react-icons/fa6";
import { twMerge } from "lib/utils";

import { defaultProps, DEFAULT_LABELS, propTypes } from "./props";
import { generateAnnotationId } from "./helpers";
import { ImageCanvas } from "./ImageCanvas";
import { TypePicker } from "./TypePicker";
import { EditorWrapper } from "./EditorWrapper";
import { AnnotationList } from "./AnnotationList";

export const PhotoAnnotator = (props) => {
    const {
        src,

        // Controlled mode
        annotations: controlledAnnotations,
        onChange,

        // Event-based mode
        initialAnnotations,
        onCreate,
        onUpdate,
        onMove,
        onDelete,

        annotationTypes,

        listPosition = "bottom",
        readOnly = false,

        onAnnotationSelect,
        onAnnotationActivate,

        showAddButton = true,
        showZoomReset = true,
        longPressMs = 500,
        minZoom = 0.5,
        maxZoom = 5,

        labels: userLabels = {},

        containerProps = {},
        headerProps = {},
        toolbarProps = {},
        imageContainerProps = {},
        listProps = {},
        listItemProps = {},
        typePickerProps = {},
        editorOverlayProps = {},
        markerProps = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // Detect mode. Event-based wins if any of its props are present.
    const isEventMode = Boolean(
        onCreate || onUpdate || onMove || onDelete || initialAnnotations !== undefined
    );

    // ----- annotations state ------------------------------------------------
    const [internalAnnotations, setInternalAnnotations] = useState(
        () => initialAnnotations || []
    );

    // Re-sync internal state when the `initialAnnotations` array reference
    // changes (e.g. the consumer reloaded from backend). Reference compare:
    // pass a stable array unless you really want a reset.
    const initialRef = useRef(initialAnnotations);
    useEffect(() => {
        if (!isEventMode) return;
        if (initialAnnotations !== initialRef.current) {
            initialRef.current = initialAnnotations;
            setInternalAnnotations(initialAnnotations || []);
        }
    }, [initialAnnotations, isEventMode]);

    const effectiveAnnotations = isEventMode
        ? internalAnnotations
        : (controlledAnnotations || []);

    const [zoom, setZoom] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [selectedId, setSelectedId] = useState(null);
    const [editorState, setEditorState] = useState(null);
    const [typePicker, setTypePicker] = useState(null);

    // ----- mutation helpers (route to controlled or event mode) -------------

    // Optimistically add `staged`. In event mode, fires onCreate; if it
    // returns a final annotation with a different id, swap the local id.
    // On failure, removes the staged entry.
    const dispatchCreate = useCallback((staged) => {
        if (isEventMode) {
            setInternalAnnotations((prev) => [...prev, staged]);
            if (onCreate) {
                Promise.resolve(onCreate(staged))
                    .then((final) => {
                        if (final && final.id !== staged.id) {
                            setInternalAnnotations((prev) =>
                                prev.map((a) => (a.id === staged.id ? final : a))
                            );
                            setSelectedId((s) => (s === staged.id ? final.id : s));
                            setEditorState((es) =>
                                es?.annotation?.id === staged.id
                                    ? { ...es, annotation: final }
                                    : es
                            );
                        }
                    })
                    .catch((err) => {
                        console.error("PhotoAnnotator.onCreate failed:", err);
                        setInternalAnnotations((prev) =>
                            prev.filter((a) => a.id !== staged.id)
                        );
                        setSelectedId((s) => (s === staged.id ? null : s));
                        setEditorState((es) =>
                            es?.annotation?.id === staged.id ? null : es
                        );
                    });
            }
            return;
        }
        onChange?.([...(controlledAnnotations || []), staged]);
    }, [isEventMode, onCreate, onChange, controlledAnnotations]);

    const dispatchUpdate = useCallback((annotation) => {
        if (isEventMode) {
            setInternalAnnotations((prev) =>
                prev.map((a) => (a.id === annotation.id ? annotation : a))
            );
            if (onUpdate) {
                Promise.resolve(onUpdate(annotation)).catch((err) => {
                    console.error("PhotoAnnotator.onUpdate failed:", err);
                });
            }
            return;
        }
        onChange?.(
            (controlledAnnotations || []).map((a) =>
                a.id === annotation.id ? annotation : a
            )
        );
    }, [isEventMode, onUpdate, onChange, controlledAnnotations]);

    const dispatchMove = useCallback((id, pos) => {
        const current = effectiveAnnotations.find((a) => a.id === id);
        if (!current) return;
        const moved = { ...current, x: pos.x, y: pos.y };
        if (isEventMode) {
            setInternalAnnotations((prev) =>
                prev.map((a) => (a.id === id ? moved : a))
            );
            if (onMove) {
                Promise.resolve(onMove(moved, pos)).catch((err) => {
                    console.error("PhotoAnnotator.onMove failed:", err);
                });
            } else if (onUpdate) {
                Promise.resolve(onUpdate(moved)).catch((err) => {
                    console.error("PhotoAnnotator.onUpdate (move) failed:", err);
                });
            }
            return;
        }
        onChange?.(
            (controlledAnnotations || []).map((a) =>
                a.id === id ? moved : a
            )
        );
    }, [effectiveAnnotations, isEventMode, onMove, onUpdate, onChange, controlledAnnotations]);

    const dispatchDelete = useCallback((annotation) => {
        if (isEventMode) {
            setInternalAnnotations((prev) =>
                prev.filter((a) => a.id !== annotation.id)
            );
            if (onDelete) {
                Promise.resolve(onDelete(annotation)).catch((err) => {
                    console.error("PhotoAnnotator.onDelete failed:", err);
                });
            }
            return;
        }
        onChange?.(
            (controlledAnnotations || []).filter((a) => a.id !== annotation.id)
        );
    }, [isEventMode, onDelete, onChange, controlledAnnotations]);

    // ----- editor / picker handlers -----------------------------------------

    const resetZoom = useCallback(() => {
        setZoom(1);
        setTranslate({ x: 0, y: 0 });
    }, []);

    const openEditorForNew = useCallback((typeKey, x, y) => {
        const def = annotationTypes[typeKey];
        if (!def) return;
        const staged = {
            id: generateAnnotationId(),
            type: typeKey,
            x,
            y,
            payload: def.newPayload ? def.newPayload() : {},
        };
        setEditorState({ annotation: staged, isNew: true });
    }, [annotationTypes]);

    const handleLongPressBackground = useCallback((x, y) => {
        if (readOnly) return;
        const keys = Object.keys(annotationTypes);
        if (keys.length === 0) return;
        if (keys.length === 1) {
            openEditorForNew(keys[0], x, y);
            return;
        }
        setTypePicker({ x, y });
    }, [readOnly, annotationTypes, openEditorForNew]);

    const handleAddButtonClick = useCallback(() => {
        if (readOnly) return;
        const keys = Object.keys(annotationTypes);
        if (keys.length === 0) return;
        const x = 50;
        const y = 50;
        if (keys.length === 1) {
            const typeKey = keys[0];
            const def = annotationTypes[typeKey];
            const staged = {
                id: generateAnnotationId(),
                type: typeKey,
                x,
                y,
                payload: def.newPayload ? def.newPayload() : {},
            };
            // Persist + select + open editor on top so the payload can be
            // filled in. dispatchCreate handles the optimistic add.
            dispatchCreate(staged);
            setSelectedId(staged.id);
            setEditorState({ annotation: staged, isNew: false });
            return;
        }
        setTypePicker({ x, y });
    }, [readOnly, annotationTypes, dispatchCreate]);

    const handlePickType = useCallback((typeKey) => {
        if (!typePicker) return;
        const { x, y } = typePicker;
        setTypePicker(null);
        openEditorForNew(typeKey, x, y);
    }, [typePicker, openEditorForNew]);

    const handleEditorSave = useCallback((partial) => {
        if (!editorState) return;
        const merged = { ...editorState.annotation, ...(partial || {}) };
        if (editorState.isNew) {
            dispatchCreate(merged);
            setSelectedId(merged.id);
        } else {
            dispatchUpdate(merged);
        }
        setEditorState(null);
    }, [editorState, dispatchCreate, dispatchUpdate]);

    const handleEditorCancel = useCallback(() => {
        setEditorState(null);
    }, []);

    const handleMarkerClick = useCallback((annotation) => {
        setSelectedId(annotation.id);
        onAnnotationSelect?.(annotation);
    }, [onAnnotationSelect]);

    const handleMarkerActivate = useCallback((annotation) => {
        onAnnotationActivate?.(annotation);
    }, [onAnnotationActivate]);

    const handleDragEnd = useCallback((id, pos) => {
        dispatchMove(id, pos);
    }, [dispatchMove]);

    const handleListEdit = useCallback((annotation) => {
        setSelectedId(annotation.id);
        setEditorState({ annotation, isNew: false });
    }, []);

    const handleListDelete = useCallback((annotation) => {
        if (!window.confirm(labels.deleteConfirm)) return;
        dispatchDelete(annotation);
        if (selectedId === annotation.id) setSelectedId(null);
    }, [dispatchDelete, selectedId, labels.deleteConfirm]);

    const editorTypeDef = editorState
        ? annotationTypes[editorState.annotation.type]
        : null;

    return (
        <div
            data-component="PhotoAnnotator"
            {...containerProps}
            className={twMerge(
                "relative flex flex-col size-full bg-gray-50 dark:bg-gray-900",
                listPosition === "right" && "sm:flex-row",
                containerProps.className
            )}
        >
            {(showAddButton || showZoomReset || headerProps.children) && (
                <div
                    {...headerProps}
                    className={twMerge(
                        "flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
                        headerProps.className
                    )}
                >
                    {headerProps.children}
                    <div
                        {...toolbarProps}
                        className={twMerge("ml-auto flex items-center gap-2", toolbarProps.className)}
                    >
                        {showZoomReset && zoom !== 1 && (
                            <button
                                type="button"
                                onClick={resetZoom}
                                aria-label={labels.zoomReset}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <FaMagnifyingGlassMinus />
                            </button>
                        )}
                        {showAddButton && !readOnly && (
                            <button
                                type="button"
                                onClick={handleAddButtonClick}
                                aria-label={labels.addAnnotation}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90"
                            >
                                <FaPlus />
                                <span className="hidden sm:inline">{labels.addAnnotation}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={twMerge("flex flex-1 min-h-0", listPosition === "right" ? "flex-row" : "flex-col")}>
                <ImageCanvas
                    src={src}
                    annotations={effectiveAnnotations}
                    annotationTypes={annotationTypes}
                    selectedId={selectedId}
                    readOnly={readOnly}
                    longPressMs={longPressMs}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    onLongPressBackground={handleLongPressBackground}
                    onMarkerClick={handleMarkerClick}
                    onMarkerDoubleClick={handleMarkerActivate}
                    onAnnotationDragEnd={handleDragEnd}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    translate={translate}
                    onTranslateChange={setTranslate}
                    imageContainerProps={imageContainerProps}
                    markerProps={markerProps}
                />

                <AnnotationList
                    annotations={effectiveAnnotations}
                    annotationTypes={annotationTypes}
                    selectedId={selectedId}
                    readOnly={readOnly}
                    position={listPosition}
                    onSelect={handleMarkerClick}
                    onActivate={handleMarkerActivate}
                    onEdit={handleListEdit}
                    onDelete={handleListDelete}
                    labels={labels}
                    listProps={listProps}
                    listItemProps={listItemProps}
                />
            </div>

            {typePicker && (
                <TypePicker
                    annotationTypes={annotationTypes}
                    onPick={handlePickType}
                    onCancel={() => setTypePicker(null)}
                    labels={labels}
                    pickerProps={typePickerProps}
                />
            )}

            {editorState && editorTypeDef && (
                <EditorWrapper
                    annotation={editorState.annotation}
                    typeDef={editorTypeDef}
                    onSave={handleEditorSave}
                    onCancel={handleEditorCancel}
                    overlayProps={editorOverlayProps}
                />
            )}
        </div>
    );
};

PhotoAnnotator.propTypes = propTypes;
PhotoAnnotator.defaultProps = defaultProps;
