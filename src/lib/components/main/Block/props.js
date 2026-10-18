import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    title: PropTypes.string,
    header: PropTypes.string,
    footer: PropTypes.string,
    /** "title-bar": renders the children as an horizontal action bar
     * (back button, title, trailing action) instead of a boxed card. */
    type: PropTypes.oneOf(["title-bar"]),
    responsive: PropTypes.bool,
    /** Extra classes merged onto the container (overrides the defaults
     * through tailwind-merge). */
    className: PropTypes.string,
    containerProps: PropTypes.object,
    titleProps: PropTypes.object,
    headerProps: PropTypes.object,
    blockProps: PropTypes.object,
    footerProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true
};
