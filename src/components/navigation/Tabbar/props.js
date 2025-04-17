import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    links: PropTypes.arrayOf(PropTypes.object),
    centralButton: PropTypes.object, // ?
    tabbarProps: PropTypes.object,
    linkProps: PropTypes.object,
    iconAndLabelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    badgeProps: PropTypes.object,
    labelProps: PropTypes.object,
};