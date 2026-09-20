import PropTypes from "prop-types";

export const propTypes = {
    variant: PropTypes.oneOf(["banner", "modal"]),
    position: PropTypes.oneOf(["top", "bottom"]),
    remindAfterDays: PropTypes.number,
    minVisits: PropTypes.number,
    report: PropTypes.bool,
    labels: PropTypes.shape({
        title: PropTypes.string,
        message: PropTypes.string,
        installButton: PropTypes.string,
        dismissButton: PropTypes.string,
        iosTitle: PropTypes.string,
        iosStep1: PropTypes.string,
        iosStep2: PropTypes.string,
        iosStep3: PropTypes.string,
        gotItButton: PropTypes.string,
    }),
    onInstalled: PropTypes.func,
    onDismiss: PropTypes.func,
};

// English defaults, deliberately generic: every consumer passes its own
// translated strings (react-i18next on the app side). Keeping real
// sentences here rather than keys means a consumer that forgets to
// translate still ships something readable.
export const DEFAULT_LABELS = {
    title: "Install the app",
    message: "Add it to your home screen for quicker access, even offline.",
    installButton: "Install",
    dismissButton: "Not now",
    iosTitle: "Add to your home screen",
    iosStep1: "Tap the Share button in the toolbar",
    iosStep2: "Choose \"Add to Home Screen\"",
    iosStep3: "Confirm with \"Add\"",
    gotItButton: "Got it",
};
