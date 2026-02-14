import PropTypes from "prop-types";

export const propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string,
    children: PropTypes.node,
    showCloseButton: PropTypes.bool,
    closeOnOverlayClick: PropTypes.bool,
    size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
    position: PropTypes.oneOf(["center", "bottom"]),
    zIndex: PropTypes.number,
    overlayProps: PropTypes.object,
    contentProps: PropTypes.object,
    headerProps: PropTypes.object,
    titleProps: PropTypes.object,
    closeButtonProps: PropTypes.object,
    bodyProps: PropTypes.object,
};
