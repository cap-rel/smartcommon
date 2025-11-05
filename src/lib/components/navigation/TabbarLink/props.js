import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    icon: PropTypes.func,
    badge: PropTypes.string,
    activeIcon: PropTypes.func,
    label: PropTypes.string,

};

export const defaultProps = {};