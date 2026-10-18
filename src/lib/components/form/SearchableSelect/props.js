import PropTypes from "prop-types";

export const propTypes = {
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.object,
    name: PropTypes.string,
    label: PropTypes.string,
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
    variant: PropTypes.object
};

export const DEFAULT_LABELS = {
    requiredError: "This field is required.",
    searchPlaceholder: "Search...",
};
