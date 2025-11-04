import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    links: PropTypes.arrayOf(PropTypes.object),
    hideOnScroll: PropTypes.bool,
    centralButton: PropTypes.object, // TODO
    tabbarProps: PropTypes.object,
    linkProps: PropTypes.object,
    iconAndLabelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    badgeProps: PropTypes.object,
    labelProps: PropTypes.object,
};

export const defaultProps = {
    hideOnScroll: false
};