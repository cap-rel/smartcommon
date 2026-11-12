import PropTypes from "prop-types";

export const propTypes = {
    /** Page title, rendered as the h1. */
    title: PropTypes.node,
    /** Next to the title (a reference, a count). */
    subtitle: PropTypes.node,
    /** Under the title. */
    breadcrumb: PropTypes.node,
    /** Shows a back button before the title. */
    onBack: PropTypes.func,
    /** Search field, centred. */
    search: PropTypes.node,
    /** Page action buttons, left of the UserMenu. */
    actions: PropTypes.node,
    /** false on chrome-less screens. */
    showUserMenu: PropTypes.bool,
    /** i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles). */
    labels: PropTypes.shape({
        back: PropTypes.string,
    }),

    headerProps: PropTypes.object,
    backButtonProps: PropTypes.object,
    titleProps: PropTypes.object,
    subtitleProps: PropTypes.object,
    searchProps: PropTypes.object,
    actionsProps: PropTypes.object,
    /** Props of the UserMenu (labels, onLogout...). */
    UserMenu: PropTypes.object,
};

export const defaultProps = {
    showUserMenu: true,
};

export const DEFAULT_LABELS = {
    // Accessible name and tooltip of the icon-only back button.
    back: "Back",
};
