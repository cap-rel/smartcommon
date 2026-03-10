import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    variant: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string, PropTypes.object]),
    defaultOpen: PropTypes.bool,
    position: PropTypes.oneOf(["bottom", "top", "left", "right"]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLogs: PropTypes.number,
    showFab: PropTypes.bool,
    containerProps: PropTypes.object,
    toolbarProps: PropTypes.object,
    logsProps: PropTypes.object,
};

export const defaultProps = {
    defaultOpen: false,
    position: "bottom",
    height: "40vh",
    maxLogs: 500,
    showFab: true,
};
