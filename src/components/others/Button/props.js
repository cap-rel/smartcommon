import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    icon: PropTypes.node,
    loading: PropTypes.bool,
    badge: PropTypes.number,
    text: PropTypes.string,
    buttonProps: PropTypes.object,
    Spinner: PropTypes.object,
    iconProps: PropTypes.object,
    badgeProps: PropTypes.object,
    textProps: PropTypes.object,
}