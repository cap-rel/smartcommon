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

    Overlay: PropTypes.object,
    popupBackdrop: PropTypes.object,
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
};