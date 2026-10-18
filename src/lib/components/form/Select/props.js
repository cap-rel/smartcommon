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
    placeholder: PropTypes.string,

    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    onChange: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),

    // Consumer-provided message, rendered by Label below the field.
    error: PropTypes.node,
    // Forces error display on standalone pages (no <Form> context).
    formSubmitted: PropTypes.bool,
    // Called with (ruleKey, conditionBoolean) each time a rule result flips.
    onError: PropTypes.func,

    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

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