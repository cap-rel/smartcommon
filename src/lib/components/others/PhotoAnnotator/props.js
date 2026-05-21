import PropTypes from "prop-types";

const annotationShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    payload: PropTypes.any,
});

const typeDefShape = PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    color: PropTypes.string,
    renderMarker: PropTypes.func.isRequired,
    renderEditor: PropTypes.func.isRequired,
    renderListItem: PropTypes.func,
    newPayload: PropTypes.func,
    // When true, the renderEditor is mounted as-is (no overlay / no modal
    // chrome). The component is expected to do its work and call onSave /
    // onCancel from a useEffect (typical for "open camera then save").
    headlessEditor: PropTypes.bool,
});

export const propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Blob),
        PropTypes.instanceOf(File),
    ]),

    // Controlled mode: pass `annotations` + `onChange`. Every mutation is
    // re-rendered via a fresh array (good for in-memory state).
    annotations: PropTypes.arrayOf(annotationShape),
    onChange: PropTypes.func,

    // Event-based mode: pass `initialAnnotations` and any of the granular
    // callbacks below. The component owns the annotations state and calls
    // these on each user action. `onCreate` may return the persisted
    // annotation (with its real id); the component will adopt it. Any
    // callback that throws causes an optimistic revert.
    initialAnnotations: PropTypes.arrayOf(annotationShape),
    onCreate: PropTypes.func,
    onUpdate: PropTypes.func,
    onMove: PropTypes.func,
    onDelete: PropTypes.func,

    annotationTypes: PropTypes.objectOf(typeDefShape).isRequired,

    listPosition: PropTypes.oneOf(["bottom", "right", "off"]),
    readOnly: PropTypes.bool,

    onAnnotationSelect: PropTypes.func,
    onAnnotationActivate: PropTypes.func,

    showAddButton: PropTypes.bool,
    showZoomReset: PropTypes.bool,
    longPressMs: PropTypes.number,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,

    labels: PropTypes.object,

    containerProps: PropTypes.object,
    headerProps: PropTypes.object,
    toolbarProps: PropTypes.object,
    imageContainerProps: PropTypes.object,
    listProps: PropTypes.object,
    listItemProps: PropTypes.object,
    typePickerProps: PropTypes.object,
    editorOverlayProps: PropTypes.object,
};

export const defaultProps = {
    annotations: [],
    listPosition: "bottom",
    readOnly: false,
    showAddButton: true,
    showZoomReset: true,
    longPressMs: 500,
    minZoom: 0.5,
    maxZoom: 5,
};

export const DEFAULT_LABELS = {
    addAnnotation: "Add an annotation",
    chooseType: "Annotation type",
    pickerCancel: "Cancel",
    listEmpty: "No annotation",
    listToggle: "Annotations",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Delete this annotation?",
    confirm: "Validate",
    cancel: "Cancel",
    zoomReset: "Reset zoom",
    untitled: "(untitled)",
};
