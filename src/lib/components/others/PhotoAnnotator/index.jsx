import { useCallback, useState } from "react";
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
        annotations = [],
        onChange,

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

    const [zoom, setZoom] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [selectedId, setSelectedId] = useState(null);

    // editorState: { annotation, isNew } | null
    // - isNew=true:  the staged annotation has not been added to `annotations` yet;
    //                onSave will append it.
    // - isNew=false: the annotation already lives in `annotations`; onSave will
    //                replace the matching entry.
    const [editorState, setEditorState] = useState(null);

    // typePicker: { x, y } | null  (image-relative percentage where the new
    // annotation should land once the user picks a type)
    const [typePicker, setTypePicker] = useState(null);

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
        // Center of the image, ready to be dragged into place.
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
            // Persist immediately + select so the user sees the marker and can
            // drag it. The editor opens on top so the payload can be filled in.
            onChange([...annotations, staged]);
            setSelectedId(staged.id);
            setEditorState({ annotation: staged, isNew: false });
            return;
        }
        setTypePicker({ x, y });
    }, [readOnly, annotationTypes, annotations, onChange]);

    const handlePickType = useCallback((typeKey) => {
        if (!typePicker) return;
        const { x, y } = typePicker;
        setTypePicker(null);
        openEditorForNew(typeKey, x, y);
    }, [typePicker, openEditorForNew]);

    const handleEditorSave = useCallback((partial) => {
        if (!editorState) return;
        // Spread merge: a partial of { payload } fully replaces payload, which
        // is the expected behaviour ("the type owns its payload").
        const merged = { ...editorState.annotation, ...(partial || {}) };
        if (editorState.isNew) {
            onChange([...annotations, merged]);
            setSelectedId(merged.id);
        } else {
            onChange(annotations.map((a) => (a.id === merged.id ? merged : a)));
        }
        setEditorState(null);
    }, [editorState, annotations, onChange]);

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
        onChange(
            annotations.map((a) =>
                a.id === id ? { ...a, x: pos.x, y: pos.y } : a
            )
        );
    }, [annotations, onChange]);

    const handleListEdit = useCallback((annotation) => {
        setSelectedId(annotation.id);
        setEditorState({ annotation, isNew: false });
    }, []);

    const handleListDelete = useCallback((annotation) => {
        if (!window.confirm(labels.deleteConfirm)) return;
        onChange(annotations.filter((a) => a.id !== annotation.id));
        if (selectedId === annotation.id) setSelectedId(null);
    }, [annotations, onChange, selectedId, labels.deleteConfirm]);

    const editorTypeDef = editorState ? annotationTypes[editorState.annotation.type] : null;

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
                    annotations={annotations}
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
                    annotations={annotations}
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
