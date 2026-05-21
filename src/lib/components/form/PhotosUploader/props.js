import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,

    accept: PropTypes.string,

    // Output format. Three modes:
    //   - "base64" (default, legacy): value is { src: base64string, title, description, gpsPoints, capture }
    //   - "blob": value is { blob: Blob, previewUrl, title, description, gpsPoints, capture, mimeType, filename }
    //     (caller handles the upload itself)
    //   - "upload": photo is POSTed to the smartauth /upload endpoint and
    //     value becomes { uploadId, previewUrl, title, description, gpsPoints,
    //     capture, mimeType, filename, size, sha256 }. The business module
    //     references uploadId from its own JSON payload and consumes the
    //     staged file server-side via SmartAuth\Api\UploadHelper.
    outputFormat: PropTypes.oneOf(["base64", "blob", "upload"]),

    // Override of the upload endpoint path (default: "upload"). Only
    // used when outputFormat === "upload".
    uploadEndpoint: PropTypes.string,

    // Optional callback when an upload fails (outputFormat === "upload").
    // Defaults to a toast.error notification.
    onUploadError: PropTypes.func,

    // Route uploads through the offline-first queue. Only meaningful when
    // outputFormat === "upload". An upload that fails offline / network /
    // 5xx is persisted in IndexedDB; the photo carries a pendingId that
    // is later swapped for uploadId via the queue's onResolved stream.
    queue: PropTypes.bool,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    exact: PropTypes.number,
    max: PropTypes.number,
    multiple: PropTypes.bool,

    compressOptions: PropTypes.object,

    name: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    defaultValue: PropTypes.bool,

    formSubmitted: PropTypes.bool,
    onError: PropTypes.func,

    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    starProps: PropTypes.object,
    childrenContainerProps: PropTypes.object,
    prefixProps: PropTypes.object,
    suffixProps: PropTypes.object,
    footerProps: PropTypes.object,
    helpIconProps: PropTypes.object,
    helpAndErrorsContainerProps: PropTypes.object,
    helpProps: PropTypes.object,
    errorProps: PropTypes.object,
    
    photosAndButtonContainerProps: PropTypes.object,
    photosContainerProps: PropTypes.object,
    emptyPhotoProps: PropTypes.object,
    buttonsContainerProps: PropTypes.object,
    CaptureButton: PropTypes.object,
    ImportButton: PropTypes.object,
    photoProps: PropTypes.object,
    imgProps: PropTypes.object,
    pendingBadgeProps: PropTypes.object,
    titleProps: PropTypes.object,
    Popup: PropTypes.object,
    popupImgProps: PropTypes.object,
    TitleInput: PropTypes.object,
    DescriptionTextarea: PropTypes.object,
    DeleteButton: PropTypes.object,

    // i18n: merged shallowly over DEFAULT_LABELS. Entries are either
    // strings or functions (when interpolated values are needed).
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "Vous devez prendre au moins 1 photo.",
    minError: (min) => `Vous devez prendre ${min} photos minimum.`,
    maxError: (max) => `Vous ne pouvez pas prendre plus de ${max} photos. Veuillez en supprimer.`,
    exactError: (exact) => `Vous devez prendre exactement ${exact} photos.`,
    geolocationError: "Echec de géolocalisation de la capture.",
    uploadError: "Echec de l'envoi de la photo.",
    clickToShow: "Cliquez pour afficher l'image",
    pendingBadge: "Envoi en attente...",
    photoPopupTitle: (index) => `Photo ${index + 1}`,
    photoPopupTitleSingle: "Photo enregistrée",
    titleField: "Titre",
    descriptionField: "Description",
    saveButton: "Enregistrez",
    emptyState: "Aucune photo enregistrée",
};