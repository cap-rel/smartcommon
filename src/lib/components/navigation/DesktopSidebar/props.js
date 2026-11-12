import PropTypes from "prop-types";

export const propTypes = {
    /** { id?, label, icon, to?, onClick?, active?, badge?, disabled? }. With
     * `to` a link navigates through the router, without it is a button.
     * `icon` is a react-icons component or an element. */
    links: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
        icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.element]),
        to: PropTypes.string,
        onClick: PropTypes.func,
        active: PropTypes.bool,
        badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        disabled: PropTypes.bool,
    })),
    /** Top of the sidebar (logo, app name): node or ({ collapsed }) => node. */
    brand: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /** Above the collapse button: node or ({ collapsed }) => node. */
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /** Controlled collapse state (not persisted by the component). */
    collapsed: PropTypes.bool,
    /** Initial state when nothing is stored yet. */
    defaultCollapsed: PropTypes.bool,
    /** Called with the next collapse state. */
    onCollapsedChange: PropTypes.func,
    /** localStorage key of the collapse state; null disables persistence. */
    storageKey: PropTypes.string,
    /** (link, pathname) => bool, replaces the default route matching. */
    isActive: PropTypes.func,
    /** i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles). */
    labels: PropTypes.shape({
        navigation: PropTypes.string,
        collapse: PropTypes.string,
        expand: PropTypes.string,
    }),

    asideProps: PropTypes.object,
    brandProps: PropTypes.object,
    navProps: PropTypes.object,
    linkProps: PropTypes.object,
    iconGlyphProps: PropTypes.object,
    badgeProps: PropTypes.object,
    footerProps: PropTypes.object,
    toggleProps: PropTypes.object,
};

export const defaultProps = {
    defaultCollapsed: false,
    storageKey: "smartcommon.desktopSidebar.collapsed",
};

export const DEFAULT_LABELS = {
    // Name of the nav landmark.
    navigation: "Main navigation",
    // Visible text of the collapse button.
    collapse: "Collapse menu",
    // Name of the button once collapsed (icon only).
    expand: "Expand menu",
};
