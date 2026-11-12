import PropTypes from "prop-types";

export const propTypes = {
    /** Variant */
    variant: PropTypes.oneOfType([PropTypes.arrayOf([PropTypes.string, PropTypes.object]), PropTypes.string, PropTypes.object]),
    /**
     * Color of the tag: success, danger (alias of error), warning, info
     * (alias of primary), primary, secondary, neutral, or a status
     * (to-complete, in-progress, done, to-do, draft, update). Unknown names
     * render neutral unless the theme defines --color-<name>-status.
     */
    color: PropTypes.string,
    /** Content of the tag */
    children: PropTypes.node,
};

export const defaultProps = {
    color: "success",
};
