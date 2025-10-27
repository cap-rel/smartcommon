import PropTypes from "prop-types";

export const propTypes = {
    /** Every component must have an id. It allows to use generated css variables (position, height, ...) and identify in some case (form errors, ...). Ex: "login-button" */
    id: PropTypes.string.isRequired,
    /** Content og  */
    label: PropTypes.string,
    /** The icon must be */
    icon: PropTypes.func,
    /** UI button component for user interaction */
    children: PropTypes.node,
    /** UI button component for user interaction */
    loading: PropTypes.bool,
    /** UI button component for user interaction */
    badge: PropTypes.number,
    /** UI button component for user interaction */
    disabled: PropTypes.bool,
    /** UI button component for user interaction */
    onClick: PropTypes.func,
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