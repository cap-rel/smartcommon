import PropTypes from "prop-types";

export const propTypes = {
    children: PropTypes.node,
    overlay: PropTypes.bool,
    closeOnClickOverlay: PropTypes.bool,
    closeOnMove: PropTypes.bool,
    isOpen: PropTypes.bool,
    close: PropTypes.func,
    Overlay: PropTypes.object,
    panelProps: PropTypes.object,
}