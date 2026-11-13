import PropTypes from "prop-types";

export const propTypes = {
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.object,
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    
    rangeMin: PropTypes.number,
    rangeMax: PropTypes.node,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,

    name: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    defaultValue: PropTypes.bool,

    // Consumer-provided message, rendered by Label below the field (unlike
    // `errors`, which useField computes from the validation rules).
    error: PropTypes.node,
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
    
    rangeContainerProps: PropTypes.object,
    inputProps: PropTypes.object,
    valueProps: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "This field is required.",
    minError: (n) => `The value must be at least ${n}.`,
    maxError: (n) => `The value must be at most ${n}.`,
};
