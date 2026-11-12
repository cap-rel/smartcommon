import PropTypes from "prop-types";

export const propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string,
    children: PropTypes.node,
    showCloseButton: PropTypes.bool,
    closeOnOverlayClick: PropTypes.bool,
    // Escape closes the modal (only the topmost dialog reacts).
    closeOnEscape: PropTypes.bool,
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.shape({
        close: PropTypes.string,
    }),
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

export const DEFAULT_LABELS = {
    // Accessible name of the icon-only close button.
    close: "Close",
};
