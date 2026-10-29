import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    /** Counter badge: hidden for 0 or an empty value, "99+" above 99. */
    badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    label: PropTypes.node,
    /** Called on click (chained after linkProps.onClick when both exist). */
    onClick: PropTypes.func,
    children: PropTypes.node,

    linkProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    badgeProps: PropTypes.object,
};

export const defaultProps = {};
