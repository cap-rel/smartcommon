import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    hideOnScroll: PropTypes.bool,
    centralButton: PropTypes.object, // TODO
    tabbarProps: PropTypes.object,
};

export const defaultProps = {
    hideOnScroll: false
};