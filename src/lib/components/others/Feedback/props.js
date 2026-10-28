import PropTypes from "prop-types";

export const propTypes = {
    // Relay endpoint path (relative to the useApi prefixUrl), e.g.
    // "feedback/report". The PWA posts multipart to this path; the module's
    // PHP relay forwards to capTests with the intake key.
    relayPath: PropTypes.string.isRequired,

    // The module decides visibility based on the user's rights.
    visible: PropTypes.bool,

    // PWA version, sent as context.app_version (diagnostic only).
    appVersion: PropTypes.string,

    // i18n: merged shallowly over DEFAULT_LABELS.
    labels: PropTypes.object,
};

export const defaultProps = {
    visible: true,
    appVersion: "",
    labels: {},
};

export const DEFAULT_LABELS = {
    buttonLabel: "Report a problem",
    title: "Report a problem",
    typeLabel: "Type",
    typeBug: "Bug",
    typeIdea: "Idea",
    titleLabel: "Title (optional)",
    titlePlaceholder: "Short summary",
    bodyLabel: "Description",
    bodyPlaceholder: "What happened? What were you trying to do?",
    bodyRequiredError: "Please describe the problem.",
    bodyTooLongError: (max) => `Description is too long (${max} characters maximum).`,
    screenshotLabel: "Screenshot",
    screenshotChoose: "Choose an image",
    screenshotCapture: "Capture the screen",
    screenshotRemove: "Remove the image",
    screenshotConsentLabel: "I confirm this screenshot shows no sensitive data, or that I have redacted it",
    screenshotConsentRequiredError: "Consent is required when an image is attached.",
    redactLabel: "Redact an area",
    submitLabel: "Send",
    submittingLabel: "Sending...",
    cancelLabel: "Cancel",
    successTitle: "Report sent",
    successMessage: (ref) => `Your report has been recorded (reference: ${ref}).`,
    successTracking: "Track my report",
    errorTitle: "Error",
    errorMessage: "The report could not be sent. Please try again later.",
    offlineMessage: "No connection. The report will be sent automatically when the network returns.",
    dictateLabel: "Dictate",
    dictateStopLabel: "Stop dictation",
    closeLabel: "Close",
};
