import PropTypes from "prop-types";

export const propTypes = {
    isOpen: PropTypes.bool,
    close: PropTypes.func,
    /** Called on overlay click, after close(). */
    onClick: PropTypes.func,
    zIndex: PropTypes.number,
    overlayProps: PropTypes.object
};