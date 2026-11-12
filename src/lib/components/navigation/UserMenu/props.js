import PropTypes from "prop-types";

import { menuItemShape } from "lib/components/others/Dropdown/props";

export const propTypes = {
    /** User shown in the trigger (username or email). Default: global state "user". */
    user: PropTypes.object,
    /** Route opened by Settings when no onSettings is given. */
    settingsPath: PropTypes.string,
    onSettings: PropTypes.func,
    /** Replaces useApi().logout(); may return a promise. */
    onLogout: PropTypes.func,
    /** Abort delay of the default logout call. */
    logoutTimeoutMs: PropTypes.number,
    showSettings: PropTypes.bool,
    /** Extra entries, between Settings and Log out. */
    items: PropTypes.arrayOf(menuItemShape),
    align: PropTypes.oneOf(["left", "right"]),
    /** Prefix of the data-testid: -trigger, -menu, -settings, -logout. */
    testId: PropTypes.string,
    /** i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles). */
    labels: PropTypes.shape({
        settings: PropTypes.string,
        logout: PropTypes.string,
        loggingOut: PropTypes.string,
        account: PropTypes.string,
    }),

    triggerProps: PropTypes.object,
    avatarProps: PropTypes.object,
    Dropdown: PropTypes.object,
};

export const defaultProps = {
    settingsPath: "/settings",
    logoutTimeoutMs: 15000,
    showSettings: true,
    align: "right",
    testId: "user-menu",
};

export const DEFAULT_LABELS = {
    settings: "Settings",
    logout: "Log out",
    loggingOut: "Logging out...",
    // Accessible name of the trigger when the user has no name to show.
    account: "Account",
};
