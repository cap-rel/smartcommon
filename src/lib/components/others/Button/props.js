import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    icon: PropTypes.node,
    loading: PropTypes.bool,
    badge: PropTypes.number,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,

    buttonProps: PropTypes.object,
    Spinner: PropTypes.object,
    iconProps: PropTypes.object,
    badgeProps: PropTypes.object,
}