import PropTypes from "prop-types";

// English source of truth. French and the other locale bundles mirror this
// shape in src/lib/locales/ (added in the i18n lot).
export const DEFAULT_LABELS = {
    title: "Edit photo",
    crop: "Crop",
    perspective: "Perspective",
    detectEdges: "Detect edges",
    noDocumentFound: "No document detected",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    flipHorizontal: "Flip horizontal",
    flipVertical: "Flip vertical",
    straighten: "Straighten",
    adjust: "Adjust",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    temperature: "Temperature",
    autoEnhance: "Auto",
    grayscale: "B&W",
    scan: "Scan",
    ratioFree: "Free",
    ratioOriginal: "Original",
    reset: "Reset",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    loadError: "Could not load the image",
    saveError: "Could not save the image",
};

// Aspect ratios offered by the crop tool. `value` is a pixel width/height
// ratio; null means free / original (no constraint).
export const DEFAULT_ASPECT_RATIOS = [
    { key: "free", label: null, value: null },
    { key: "original", label: null, value: "original" },
    { key: "1:1", label: "1:1", value: 1 },
    { key: "4:3", label: "4:3", value: 4 / 3 },
    { key: "3:4", label: "3:4", value: 3 / 4 },
    { key: "16:9", label: "16:9", value: 16 / 9 },
];

export const propTypes = {
    open: PropTypes.bool,
    // URL string, or a Blob/File, or an ImageBitmap.
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    // (blob, { operations }) => void  -- baked image + re-applicable recipe.
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onError: PropTypes.func,

    // Which tools to show, in order. v1 geometry set by default.
    tools: PropTypes.arrayOf(
        PropTypes.oneOf(["crop", "perspective", "rotate", "flip", "straighten", "adjust"])
    ),
    aspectRatios: PropTypes.array,

    // Max half-angle for the straighten slider, in degrees.
    maxStraightenAngle: PropTypes.number,

    // Encoding options forwarded to the engine (browser-image-compression-like).
    output: PropTypes.shape({
        type: PropTypes.string,
        quality: PropTypes.number,
        maxWidth: PropTypes.number,
        maxHeight: PropTypes.number,
    }),

    // Largest dimension of the in-memory preview canvas (perf on mobile).
    previewMaxDimension: PropTypes.number,

    labels: PropTypes.object,

    // Styling slots (merged with twMerge).
    containerProps: PropTypes.object,
    headerProps: PropTypes.object,
    titleProps: PropTypes.object,
    canvasAreaProps: PropTypes.object,
    toolbarProps: PropTypes.object,
    footerProps: PropTypes.object,
};

export const defaultProps = {
    open: true,
    tools: ["crop", "perspective", "rotate", "flip", "straighten", "adjust"],
    aspectRatios: DEFAULT_ASPECT_RATIOS,
    maxStraightenAngle: 45,
    output: { type: "image/jpeg", quality: 0.9 },
    previewMaxDimension: 1400,
};
