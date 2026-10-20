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
        stepsTitle: PropTypes.string,
        // One list of steps per guide key (see detectInstallGuide). The
        // "ios" guide falls back to iosStep1..3.
        guides: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
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
    stepsTitle: "How to install it",
    guides: {
        "in-app": [
            "This page is open inside another app, which cannot install it",
            "Open the menu of that app and choose \"Open in browser\"",
            "Then follow the instructions shown in your browser",
        ],
        android: [
            "Open the browser menu (three dots, top right)",
            "Choose \"Install app\" or \"Add to Home screen\"",
            "Confirm with \"Install\"",
        ],
        "android-firefox": [
            "Open the browser menu (three dots)",
            "Choose \"Install\" or \"Add to Home screen\"",
            "Confirm with \"Add\"",
        ],
        "android-samsung": [
            "Tap the install icon in the address bar, or open the menu (three lines)",
            "Choose \"Add page to\" then \"Home screen\"",
            "Confirm with \"Add\"",
        ],
        "desktop-chromium": [
            "Click the install icon at the right end of the address bar",
            "Or open the browser menu and choose \"Install\"",
            "Confirm with \"Install\": the app gets its own window and icon",
        ],
        "macos-safari": [
            "Open the File menu of Safari",
            "Choose \"Add to Dock\"",
            "Confirm with \"Add\"",
        ],
        "desktop-firefox": [
            "Firefox cannot install web apps on a computer",
            "Open this page in Chrome or Edge to install it",
            "Or bookmark it (Ctrl+D) to find it quickly",
        ],
        unknown: [
            "Open your browser menu",
            "Choose \"Install\" or \"Add to Home screen\"",
            "Confirm the installation",
        ],
    },
};
