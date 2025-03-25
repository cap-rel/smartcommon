import PropTypes from "prop-types";

export const tabbarLinkPropTypes = {
    icon: PropTypes.node,
    activeIcon: PropTypes.node,
    label: PropTypes.node,
    disabled: PropTypes.bool,
    variant: PropTypes.any,

    linkProps: PropTypes.object,
    iconAndLabelContainerProps: PropTypes.object,
    iconContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
}