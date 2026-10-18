import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    responsive: PropTypes.bool,
    hideOnScroll: PropTypes.bool,
    tabbarProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    hideOnScroll: false
};