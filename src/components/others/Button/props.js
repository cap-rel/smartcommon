import PropTypes from "prop-types";

export const propTypes = {
    left: PropTypes.node,
    right: PropTypes.node,
    floatingPosition: PropTypes.oneOf(["top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "center"]),

    buttonProps: PropTypes.object,
    leftProps: PropTypes.object,
    rightProps: PropTypes.object,
}