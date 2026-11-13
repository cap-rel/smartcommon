import PropTypes from "prop-types";

export const propTypes = {
    /** "light" (default), "dark", or "auto" to follow the system setting. */
    mode: PropTypes.oneOf(["light", "dark", "auto"]),
    /** Element that receives the dark class (default: the html element). */
    target: PropTypes.object,
};
