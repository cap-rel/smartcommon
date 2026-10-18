import PropTypes from "prop-types";

export const arrayPropTypes = {
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.object,
    label: PropTypes.string,
    help: PropTypes.string,
    onValueChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.array,
    defaultValue: PropTypes.array,
  
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    arrayContainerProps: PropTypes.object,
    arrayInputProps: PropTypes.object,
    tagsContainerProps: PropTypes.object,
    tagProps: PropTypes.object,
    inputProps: PropTypes.object,
};

export const DEFAULT_LABELS = {
    addPlaceholder: "Add...",
};
