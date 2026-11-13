import PropTypes from "prop-types";

export const propTypes = {
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.object,
    label: PropTypes.string,
    help: PropTypes.string,
    onValueChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
  
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    // Required star (shown when `required` is set).
    starProps: PropTypes.object,
    // Former name of `starProps`, used only when `starProps` is absent.
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    textareaContainerProps: PropTypes.object,
    textareaProps: PropTypes.object,
    htmlProps: PropTypes.object,
    buttonContainerProps: PropTypes.object,
    mdButtonProps: PropTypes.object,
    mdButtonIconProps: PropTypes.object,
    mdButtonLabelProps: PropTypes.object,
    htmlButtonProps: PropTypes.object,
    htmlButtonIconProps: PropTypes.object,
    htmlButtonLabelProps: PropTypes.object,
};

export const DEFAULT_LABELS = {
    markdownButton: "Markdown",
    previewButton: "Preview",
};
