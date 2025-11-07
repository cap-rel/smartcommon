import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    responsive: PropTypes.bool,
    icon: PropTypes.func,
    badge: PropTypes.string,
    activeIcon: PropTypes.func,
    label: PropTypes.string,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    containerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
};

export const defaultProps = {
    disabled: false,
    responsive: false,
    onClick: () => {}
};