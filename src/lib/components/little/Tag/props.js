import PropTypes from "prop-types";

export const propTypes = {
    /** Variant */
    variant: PropTypes.oneOfType([PropTypes.arrayOf([PropTypes.string, PropTypes.object]), PropTypes.string, PropTypes.object]),
    /** Color of the tag (e.g., success, danger, warning, info) */
    color: PropTypes.string,
    /** Content of the tag */
    children: PropTypes.node,
};

export const defaultProps = {
    color: "success",
};
