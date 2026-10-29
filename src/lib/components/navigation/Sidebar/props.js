import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    toggleButton: PropTypes.bool,
    /** Slide the toggle button away while the content scrolls down, bring it
     * back on scroll up. Off by default; ignored while the Sidebar is open. */
    hideButtonOnScroll: PropTypes.bool,
    open: PropTypes.func,
    /** Links: { label, icon, activeIcon, to, onClick, active, disabled,
     * badge }. With `to` a link navigates through the router, without it is
     * a button. `badge` is a counter: hidden for 0, "99+" above 99. */
    links: PropTypes.arrayOf(PropTypes.object),
    duration: PropTypes.number,
    children: PropTypes.node,

    Panel: PropTypes.object,
    Button: PropTypes.object,
    linkProps: PropTypes.object,
    iconAndLabelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    badgeProps: PropTypes.object,
};