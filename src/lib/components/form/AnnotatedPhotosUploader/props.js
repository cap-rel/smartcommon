import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,

    // Value: an array of PhotosUploader photos (any outputFormat), each one
    // carrying two extra keys owned by this component:
    //   - uid: stable client-side identity, set when the photo is added and
    //     kept across uploads / queue resolution. A server keys the photo
    //     and its annotations on it.
    //   - annotations: PhotoAnnotator entries [{ id, type, x, y, payload }].
    // Photos coming from a server without `uid` are accepted as-is.
    name: PropTypes.string,
    value: PropTypes.array,
    defaultValue: PropTypes.array,
    onChange: PropTypes.func,

    // PhotoAnnotator type registry (required to annotate anything).
    annotationTypes: PropTypes.object.isRequired,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    exact: PropTypes.number,
    // Capture and import are disabled once `max` photos are taken.
    max: PropTypes.number,

    // Passed through to PhotosUploader.
    accept: PropTypes.string,
    outputFormat: PropTypes.oneOf(["base64", "blob", "upload"]),
    uploadEndpoint: PropTypes.string,
    onUploadError: PropTypes.func,
    queue: PropTypes.bool,
    compressOptions: PropTypes.object,

    formSubmitted: PropTypes.bool,
    onError: PropTypes.func,

    annotateButtonProps: PropTypes.object,
    annotateCountProps: PropTypes.object,
    // Sub-component props (labels, styling...), merged over the defaults.
    PhotosUploader: PropTypes.object,
    PhotoAnnotator: PropTypes.object,
    Modal: PropTypes.object,

    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    annotate: "Annotate",
    viewAnnotations: "View annotations",
    annotationsTitle: (index) => `Annotations - photo ${index + 1}`,
};
