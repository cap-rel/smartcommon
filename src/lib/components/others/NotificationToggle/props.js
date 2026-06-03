import PropTypes from "prop-types";

export const propTypes = {
    // Optional subscription label forwarded to subscribe(label) (e.g. device name).
    label: PropTypes.string,
    // i18n: override any DEFAULT_LABELS key. Defaults are English (source of truth).
    labels: PropTypes.shape({
        toggleLabel: PropTypes.string,
        unsupported: PropTypes.string,
        denied: PropTypes.string,
        deniedHint: PropTypes.string,
    }),
    // Styling slot merged onto the root container via twMerge.
    containerProps: PropTypes.object,
    className: PropTypes.string,
};

export const defaultProps = {
    labels: {},
};

export const DEFAULT_LABELS = {
    toggleLabel: "Receive push notifications",
    unsupported: "Notifications are not supported by this browser",
    denied: "Notifications are blocked",
    deniedHint: "Change your browser settings to enable them",
};
