import PropTypes from "prop-types";

export const propTypes = {
    children: PropTypes.node,
    labels: PropTypes.shape({
        confirmReloadMessage: PropTypes.string,
    }),
    // Optional async hook called after confirm-OK and before the
    // page reload. Lets the consumer flush drafts, log analytics, etc.
    // Throwing in this callback is logged but does NOT cancel the reload.
    onPreferenceChange: PropTypes.func,
};

export const DEFAULT_LABELS = {
    confirmReloadMessage: "Changing the view will reload the application. Continue?",
};
