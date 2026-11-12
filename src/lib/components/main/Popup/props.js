import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    responsive: PropTypes.bool,
    children: PropTypes.node,
    overlay: PropTypes.bool,
    closeOnClickOverlay: PropTypes.bool,
    // Escape closes the popup. Defaults to closeOnClickOverlay: a popup that
    // must be answered stays open on both.
    closeOnEscape: PropTypes.bool,
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.shape({
        close: PropTypes.string,
    }),
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
    closeButton: false,
    overlay: true,
    closeOnClickOverlay: true,
    keepMounted: true,
};

export const DEFAULT_LABELS = {
    // Accessible name of the icon-only close button.
    close: "Close",
};
