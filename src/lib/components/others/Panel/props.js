import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    position: PropTypes.oneOf(["bottom", "right", "top", "left"]),
    overlay: PropTypes.bool,
    closeOnClickOverlay: PropTypes.bool,
    closeOnDrag: PropTypes.bool,
    isOpen: PropTypes.bool,
    close: PropTypes.func,
    duration: PropTypes.number,
    goBackLimit: PropTypes.number,
    zIndex: PropTypes.number,

    overlayProps: PropTypes.object,
    panelProps: PropTypes.object,
};

export const defaultProps = {
    zIndex: 40,
    position: "bottom",
    overlay: true,
    closeOnClickOverlay: true,
    closeOnDrag: true,
    duration: 0.18,
    goBackLimit: 1/5
};