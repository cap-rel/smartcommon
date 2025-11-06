import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    responsive: PropTypes.bool,
    hideOnScroll: PropTypes.bool,
    centralButton: PropTypes.object, // TODO
    tabbarProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    hideOnScroll: false
};