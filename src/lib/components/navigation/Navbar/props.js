import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    responsive: PropTypes.bool,
    hideOnScroll: PropTypes.bool,
    children: PropTypes.node,
    title: PropTypes.string,
    left: PropTypes.array,
    right: PropTypes.array,
    bottom: PropTypes.array,

    navbarProps: PropTypes.object,
    upperNavbarProps: PropTypes.object,
    leftContainerProps: PropTypes.object,
    titleProps: PropTypes.object,
    rightContainerProps: PropTypes.object,
    bottomContainerProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    hideOnScroll: true
};