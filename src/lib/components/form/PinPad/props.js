import PropTypes from "prop-types";

// Icon-only keys carry no visible text, so their accessible name comes from
// these labels. Overridable per app for i18n; the digit keys keep their own
// visible glyph as accessible name and need no label.
export const DEFAULT_LABELS = {
    backspace: "Backspace",
    validate: "Validate",
};

export const propTypes = {
    // Current entered digits (controlled).
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    // Called when the validate key is pressed and value length is in range.
    onSubmit: PropTypes.func,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    // "light" for a card background, "dark" for a black full-screen lock overlay.
    tone: PropTypes.oneOf(["light", "dark"]),
    // Physical keyboard support. "global" (or true) listens on `document` (lock
    // screen); "local" only reacts while the pad itself is focused (settings
    // pinpad sharing the page with other fields); false disables it (touch only).
    keyboard: PropTypes.oneOf([true, false, "global", "local"]),
    // Renders the entered dots in an error color (wrong PIN feedback).
    error: PropTypes.bool,
    disabled: PropTypes.bool,
    // Accessible labels for the icon-only keys (see DEFAULT_LABELS).
    labels: PropTypes.object,
    className: PropTypes.string,
};

export const defaultProps = {
    onSubmit: null,
    minLength: 4,
    maxLength: 8,
    tone: "light",
    keyboard: "global",
    error: false,
    disabled: false,
    labels: {},
    className: "",
};
