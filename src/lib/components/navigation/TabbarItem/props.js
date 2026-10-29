import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    responsive: PropTypes.bool,
    icon: PropTypes.func,
    /** Counter badge on the icon: hidden for 0 or an empty value, "99+" above 99. */
    badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    activeIcon: PropTypes.func,
    label: PropTypes.string,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    containerProps: PropTypes.object,
    iconAndLabelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    badgeProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    disabled: false,
    onClick: () => {}
};