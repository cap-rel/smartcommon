import PropTypes from "prop-types";

export const propTypes = {
    position: PropTypes.oneOf(["left", "right"]),
    overlayProps: PropTypes.object,
    sidebarProps: PropTypes.object,
    buttonProps: PropTypes.object,
};