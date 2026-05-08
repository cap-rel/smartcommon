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
});

export const propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Blob),
        PropTypes.instanceOf(File),
    ]),
    annotations: PropTypes.arrayOf(annotationShape),
    onChange: PropTypes.func.isRequired,

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
    addAnnotation: "Ajouter une annotation",
    chooseType: "Type d'annotation",
    pickerCancel: "Annuler",
    listEmpty: "Aucune annotation",
    listToggle: "Annotations",
    edit: "Modifier",
    delete: "Supprimer",
    deleteConfirm: "Supprimer cette annotation ?",
    confirm: "Valider",
    cancel: "Annuler",
    zoomReset: "Réinitialiser le zoom",
    untitled: "(sans titre)",
};
