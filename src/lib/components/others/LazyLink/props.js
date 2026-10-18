import PropTypes from "prop-types";

export const propTypes = {
    /** Target route. */
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    /** Router state passed to the target location. */
    state: PropTypes.any,
    /** Replaces the current history entry instead of pushing one. */
    replace: PropTypes.bool,
    /** Delay in ms between the click and the navigation. */
    duration: PropTypes.number,
    /** Called on click with the event; calling e.preventDefault() cancels the navigation. */
    onClick: PropTypes.func,
    children: PropTypes.node,
    /** Props forwarded to the underlying react-router <Link>. */
    Link: PropTypes.object,
};
