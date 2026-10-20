import PropTypes from "prop-types";

export const propTypes = {
    autoReload: PropTypes.bool,
    checkInterval: PropTypes.number,
    variant: PropTypes.oneOf(["toast", "banner", "modal"]),
    position: PropTypes.oneOf(["top", "bottom"]),
    versionUrl: PropTypes.string,
    labels: PropTypes.shape({
        title: PropTypes.string,
        message: PropTypes.string,
        messageWithVersion: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        reloadButton: PropTypes.string,
    }),
    onUpdateAvailable: PropTypes.func,
    onUpdateActivated: PropTypes.func,
};

export const DEFAULT_LABELS = {
    title: "Update available",
    message: "A new version is available.",
    messageWithVersion: (version) => `Version ${version} is available.`,
    reloadButton: "Refresh",
};
