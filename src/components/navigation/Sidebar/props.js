import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    toggleButton: PropTypes.bool,
    open: PropTypes.func,
    hideButtonOnScroll: PropTypes.bool,
    links: PropTypes.arrayOf(PropTypes.object),
    duration: PropTypes.number,
    children: PropTypes.node,

    Panel: PropTypes.object,
    Button: PropTypes.object,
    linkProps: PropTypes.object,
    iconAndLabelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    badgeProps: PropTypes.object,
    labelProps: PropTypes.object,
};