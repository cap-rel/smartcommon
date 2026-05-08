import PropTypes from "prop-types";

export const propTypes = {
    /** Every component must have an id. It allows to use generated css variables (position, height, ...) and identify in some case (form errors, ...). Ex: "login-button" */
    id: PropTypes.string.isRequired,
    responsive: PropTypes.bool,
    /** Variant */
    variant: PropTypes.oneOfType([PropTypes.arrayOf([PropTypes.string, PropTypes.object]), PropTypes.string, PropTypes.object]),
    /** Content og  */
    label: PropTypes.string,
    /** The icon must be */
    icon: PropTypes.func,
    /** UI button component for user interaction */
    children: PropTypes.node,
    /** UI button component for user interaction */
    loading: PropTypes.bool,
    /** UI button component for user interaction */
    badge: PropTypes.string,
    /** UI button component for user interaction */
    disabled: PropTypes.bool,
    /** UI button component for user interaction */
    onClick: PropTypes.func,
    /** When set, the Button renders as an <a> element. Useful for
     * tel:/mailto:/maps: and external navigation where you want native
     * browser handling (right-click, "open in new tab", URL preview).
     * `type="submit"` is ignored when `href` is provided. */
    href: PropTypes.string,
    /** Anchor target. Only used when `href` is set. */
    target: PropTypes.string,
    /** Anchor rel. Auto-set to "noopener noreferrer" when target="_blank"
     * and rel is unspecified. Only used when `href` is set. */
    rel: PropTypes.string,
    /** UI button component for user interaction */
    buttonProps: PropTypes.object,
    /** UI button component for user interaction */
    Spinner: PropTypes.object,
    /** UI button component for user interaction */
    iconProps: PropTypes.object,
    /** UI button component for user interaction */
    labelProps: PropTypes.object,  
    /** UI button component for user interaction */
    badgeProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    loading: false,
    disabled: false,
    onClick: () => {}
};