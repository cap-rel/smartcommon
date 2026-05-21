import PropTypes from "prop-types";

export const propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    appName: PropTypes.string.isRequired,
    version: PropTypes.string,
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.node,
        })
    ),
    labels: PropTypes.shape({
        title: PropTypes.string,
        application: PropTypes.string,
        version: PropTypes.string,
        close: PropTypes.string,
        checkUpdates: PropTypes.string,
        checking: PropTypes.string,
        upToDate: PropTypes.string,
        updating: PropTypes.string,
        installUpdate: PropTypes.string,
        updatesNotSupported: PropTypes.string,
        checkError: PropTypes.string,
    }),
};

export const defaultProps = {
    fields: [],
    labels: {},
};

export const DEFAULT_LABELS = {
    title: "About",
    application: "Application",
    version: "Version",
    close: "Close",
    checkUpdates: "Check for updates",
    checking: "Checking...",
    upToDate: "Application up to date",
    updating: "Updating...",
    installUpdate: "Install update",
    updatesNotSupported: "Updates not supported on this browser",
    checkError: "Error during check",
};
