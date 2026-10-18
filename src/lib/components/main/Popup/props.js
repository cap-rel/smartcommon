import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    responsive: PropTypes.bool,
    children: PropTypes.node,
    overlay: PropTypes.bool,
    closeOnClickOverlay: PropTypes.bool,
    title: PropTypes.string,
    closeButton: PropTypes.bool,
    isOpen: PropTypes.bool,
    close: PropTypes.func,
    keepMounted: PropTypes.bool,
    zIndex: PropTypes.number,

    Overlay: PropTypes.object,
    popupBackdropProps: PropTypes.object,
    popupProps: PropTypes.object,
    titleAndButtonContainerProps: PropTypes.object,
    titleProps: PropTypes.object,
    Button: PropTypes.object
};

export const defaultProps = {
    responsive: true,
    closeButton: true,
    overlay: true,
    closeOnClickOverlay: true,
    keepMounted: true,
};