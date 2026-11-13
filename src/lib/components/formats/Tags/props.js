import PropTypes from "prop-types";

export const propTypes = {
    /** Per-tag color: the tag whose text equals an option's value takes its color. */
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        color: PropTypes.string,
    })),
    value: PropTypes.array,
    /** Fallback color of the tags matching no option (default "primary"). */
    color: PropTypes.string,

    tagsContainerProps: PropTypes.object,
    Tag: PropTypes.object,
};
