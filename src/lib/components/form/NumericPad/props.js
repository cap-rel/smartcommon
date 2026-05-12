import PropTypes from "prop-types";

export const DEFAULT_LABELS = {
    confirm: "Confirm",
    backspace: "Backspace",
    decimalSeparator: "Decimal separator",
    digit: (key) => `Digit ${key}`,
};

export const propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onConfirm: PropTypes.func,
    mode: PropTypes.oneOf(["integer", "decimal"]),
    label: PropTypes.string,
    labels: PropTypes.object,
    backspaceIcon: PropTypes.node,
    confirmIcon: PropTypes.node,
    className: PropTypes.string,
};

export const defaultProps = {
    onConfirm: null,
    mode: "integer",
    label: "",
    labels: {},
    backspaceIcon: undefined,
    confirmIcon: undefined,
    className: "",
};
