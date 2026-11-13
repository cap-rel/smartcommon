import PropTypes from "prop-types";

export const propTypes = {
    /** "browser" (default, history API) or "hash" (routing in the URL fragment). */
    type: PropTypes.oneOf(["browser", "hash"]),
    /** Base path of the browser router; ignored by the hash router. */
    basename: PropTypes.string,
    children: PropTypes.node,
};
