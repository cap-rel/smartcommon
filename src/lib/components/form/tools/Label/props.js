import PropTypes from "prop-types";

export const propTypes = {
    // Links the visible label and the error messages to the field.
    id: PropTypes.string,
    label: PropTypes.node,
    icon: PropTypes.node,
    help: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    required: PropTypes.bool,
    // Displays the failing rules of `errors` (set once the form is submitted).
    showErrors: PropTypes.bool,
    // Validation rules from useField: { ruleKey: { condition, message } },
    // a rule whose condition is true is failing.
    errors: PropTypes.object,
    // Consumer-provided message, shown whatever `showErrors` says.
    error: PropTypes.node,
    children: PropTypes.node,
    // From the parent's useVariantMerger; without it, each slot reads its
    // `<slot>Props` prop directly.
    mergeProps: PropTypes.func,

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
};
