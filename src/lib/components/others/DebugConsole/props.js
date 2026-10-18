import PropTypes from "prop-types";

export const propTypes = {
    defaultOpen: PropTypes.bool,
    position: PropTypes.oneOf(["bottom", "top", "left", "right"]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLogs: PropTypes.number,
    showFab: PropTypes.bool,
};

export const defaultProps = {
    defaultOpen: false,
    position: "bottom",
    height: "40vh",
    maxLogs: 500,
    showFab: true,
};
