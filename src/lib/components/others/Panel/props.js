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

    Overlay: PropTypes.object,
    panelProps: PropTypes.object,
};

export const defaultProps = {
    position: "bottom",
    overlay: true,
    closeOnClickOverlay: true,
    closeOnDrag: true,
};