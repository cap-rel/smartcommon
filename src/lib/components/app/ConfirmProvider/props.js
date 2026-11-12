import PropTypes from "prop-types";

export const propTypes = {
    children: PropTypes.node,
    // i18n: merged shallowly over DEFAULT_LABELS. A per-call cancelText /
    // confirmText still wins.
    labels: PropTypes.shape({
        cancel: PropTypes.string,
        confirm: PropTypes.string,
    }),
};

export const DEFAULT_LABELS = {
    cancel: "Cancel",
    confirm: "OK",
};
