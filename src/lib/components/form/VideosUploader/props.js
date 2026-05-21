import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,

    accept: PropTypes.string,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    exact: PropTypes.number,
    max: PropTypes.number,
    multiple: PropTypes.bool,

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
    
    videosAndButtonContainerProps: PropTypes.object,
    videosContainerProps: PropTypes.object,
    emptyVideoProps: PropTypes.object,
    buttonsContainerProps: PropTypes.object,
    CaptureButton: PropTypes.object,
    ImportButton: PropTypes.object,
    videoProps: PropTypes.object,
    imgProps: PropTypes.object,
    titleProps: PropTypes.object,
    Popup: PropTypes.object,
    videoPlayerProps: PropTypes.object,
    TitleInput: PropTypes.object,
    DescriptionTextarea: PropTypes.object,
    DeleteButton: PropTypes.object,

    // i18n: merged shallowly over DEFAULT_LABELS. Entries are either
    // strings or functions (when interpolated values are needed).
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "You must record at least 1 video.",
    minError: (min) => `You must take at least ${min} videos.`,
    maxError: (max) => `You cannot take more than ${max} videos. Please delete some.`,
    exactError: (exact) => `You must take exactly ${exact} videos.`,
    geolocationError: "Failed to get capture location.",
    videoPopupTitle: (index) => `Video ${index + 1}`,
    videoPopupTitleSingle: "Saved video",
    titleField: "Title",
    descriptionField: "Description",
    deleteButton: "Delete video",
    emptyState: "No video saved",
};