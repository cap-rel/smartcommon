import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    responsive: PropTypes.bool,
    /** Router location; drives the transition animation between pages. */
    location: PropTypes.object,
    /** Extra classes merged onto the page container (overrides the defaults
     * through tailwind-merge). */
    className: PropTypes.string,
    /** Rendered in the compact page header. */
    title: PropTypes.node,
    /** Rendered before the title in the compact page header. */
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /** Rendered at the end of the compact page header (node or builder). */
    actions: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /** Shows a back button in the header (with onBack, or history.back). */
    showBack: PropTypes.bool,
    /** Called when the header back button is clicked. */
    onBack: PropTypes.func,
    children: PropTypes.node,
    pageProps: PropTypes.object,
    contentProps: PropTypes.object,
    headerProps: PropTypes.object,
    BackButton: PropTypes.object,
    headerIconProps: PropTypes.object,
    headerTitleProps: PropTypes.object,
    headerActionsProps: PropTypes.object
};

export const defaultProps = {
    responsive: true
};
