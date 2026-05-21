import PropTypes from "prop-types";

export const propTypes = {
    autoReload: PropTypes.bool,
    checkInterval: PropTypes.number,
    variant: PropTypes.oneOf(["toast", "banner", "modal"]),
    position: PropTypes.oneOf(["top", "bottom"]),
    labels: PropTypes.shape({
        title: PropTypes.string,
        message: PropTypes.string,
        reloadButton: PropTypes.string,
        dismissButton: PropTypes.string,
    }),
    onUpdateAvailable: PropTypes.func,
    onUpdateActivated: PropTypes.func,
};

export const DEFAULT_LABELS = {
    title: "Update available",
    message: "A new version is available.",
    reloadButton: "Refresh",
    dismissButton: "Later",
};
