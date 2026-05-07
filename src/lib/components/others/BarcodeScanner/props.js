import PropTypes from "prop-types";

export const propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onScan: PropTypes.func.isRequired,
    continuous: PropTypes.bool,
    formats: PropTypes.arrayOf(PropTypes.string),
    fps: PropTypes.number,
    qrbox: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),
    debounceMs: PropTypes.number,
    feedbackContent: PropTypes.node,
    labels: PropTypes.shape({
        title: PropTypes.string,
        cameraPermissionDenied: PropTypes.string,
        cameraError: PropTypes.string,
        enterManually: PropTypes.string,
        manualPlaceholder: PropTypes.string,
        validate: PropTypes.string,
    }),
};

export const defaultProps = {
    continuous: false,
    fps: 10,
    qrbox: { width: 280, height: 150 },
    debounceMs: 1500,
    labels: {},
};

export const DEFAULT_LABELS = {
    title: "Scanner un code",
    cameraPermissionDenied: "Permission caméra refusée. Autorisez l'accès dans les paramètres du navigateur.",
    cameraError: "Impossible d'accéder à la caméra.",
    enterManually: "Saisir manuellement",
    manualPlaceholder: "Code...",
    validate: "Valider",
};

// Format names accepted by `formats` prop. Resolved at runtime to
// Html5QrcodeSupportedFormats values once the library is lazy-loaded.
export const FORMAT_NAMES = [
    "QR_CODE",
    "EAN_13",
    "EAN_8",
    "UPC_A",
    "UPC_E",
    "CODE_128",
    "CODE_39",
    "CODE_93",
    "CODABAR",
    "DATA_MATRIX",
    "PDF_417",
    "ITF",
    "AZTEC",
    "MAXICODE",
    "RSS_14",
    "RSS_EXPANDED",
];

export const DEFAULT_FORMATS = [
    "QR_CODE",
    "EAN_13",
    "EAN_8",
    "UPC_A",
    "UPC_E",
    "CODE_128",
    "CODE_39",
];
