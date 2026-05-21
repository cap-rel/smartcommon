import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    
    type: PropTypes.oneOf(["switch", "checkbox", "icon", "radio"]),
    checkedIcon: PropTypes.node,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    exact: PropTypes.number,
    max: PropTypes.number,
    multiple: PropTypes.bool,
    options: PropTypes.array,

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
    
    optionsContainerProps: PropTypes.object,
    optionProps: PropTypes.object,
    optionLabelProps: PropTypes.object,
    switchProps: PropTypes.object,
    switchCircleProps: PropTypes.object,
    checkboxProps: PropTypes.object,
    checkboxIconProps: PropTypes.object,
    radioProps: PropTypes.object,
    checkedIconProps: PropTypes.object,

    // i18n: merged shallowly over DEFAULT_LABELS. Entries are either
    // strings or functions (when interpolated values are needed).
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "One box must be checked.",
    minError: (min) => `At least ${min} boxes must be checked.`,
    maxError: (max) => `At most ${max} boxes must be checked.`,
    exactError: (exact) => `Exactly ${exact} boxes must be checked.`,
};