import PropTypes from "prop-types";

export const propTypes = {
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.object,
    id: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
        })
    ),
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    // Consumer-provided message, rendered by Label below the field (unlike
    // `errors`, which useField computes from the validation rules).
    error: PropTypes.node,
    variant: PropTypes.object,

    // containerProps is applied both by Label (outer wrapper) and to the
    // relative wrapper of the input and its dropdown.
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
    inputProps: PropTypes.object,
    clearButtonProps: PropTypes.object,
    dropdownProps: PropTypes.object,
    emptyMessageProps: PropTypes.object,
    optionProps: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "This field is required.",
    searchPlaceholder: "Search...",
};
