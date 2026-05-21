import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,

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
    
    selectProps: PropTypes.object,
    optionProps: PropTypes.object,

    // i18n: merged shallowly over DEFAULT_LABELS. Entries are either
    // strings or functions (when interpolated values are needed).
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "At least one item must be selected.",
    minError: (min) => `At least ${min} items must be selected.`,
    maxError: (max) => `At most ${max} items must be selected.`,
    exactError: (exact) => `Exactly ${exact} items must be selected.`,
    notAnOptionError: "The selected value is not among the options",
};