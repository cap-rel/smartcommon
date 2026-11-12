import { useState } from "react";
import { FaGear, FaChevronDown } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";

import { useApi, useGlobalStates, useNavigation, useVariantMerger } from "lib/hooks";
import { createLogger } from "lib/utils";
import { Dropdown } from "lib/components/others/Dropdown";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

const logger = createLogger("UserMenu");

/**
 * Desktop user menu, pinned top right by DesktopHeader: avatar + name, and a
 * Dropdown with Settings and Log out.
 *
 * Works without props inside the root <Provider>: the user is read from the
 * global state ("user"), Settings navigates to `settingsPath`, Log out calls
 * useApi().logout() bounded by `logoutTimeoutMs`. Each can be replaced
 * (`user`, `onSettings`, `onLogout`), and `items` adds entries between them.
 */
export const UserMenu = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("UserMenu", props);
    const {
        user: userProp,
        settingsPath = "/settings",
        onSettings,
        onLogout,
        logoutTimeoutMs = 15000,
        showSettings = true,
        items: extraItems = [],
        align = "right",
        testId = "user-menu",
        labels: userLabels,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const api = useApi();
    const gst = useGlobalStates();
    const nav = useNavigation();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const user = userProp ?? gst.get?.("user") ?? {};
    const username = user?.username || user?.email || "";
    const initials = (username || "?").trim().slice(0, 2).toUpperCase();

    const handleSettings = () => {
        if (typeof onSettings === "function") {
            onSettings();
            return;
        }
        if (typeof nav.replace !== "function") {
            logger.error(`cannot open ${settingsPath}: no NavigationProvider above UserMenu (mount <Provider>)`);
            return;
        }
        nav.replace().to(settingsPath);
    };

    const handleLogout = () => {
        const logout = typeof onLogout === "function"
            ? onLogout
            : typeof api.logout === "function"
                ? () => api.logout({ signal: AbortSignal.timeout(logoutTimeoutMs) })
                : null;
        if (!logout) {
            logger.error("cannot log out: no onLogout and no ApiProvider above UserMenu (mount <Provider>)");
            return;
        }
        setIsLoggingOut(true);
        Promise.resolve()
            .then(logout)
            .catch((err) => logger.error("logout failed", err))
            .finally(() => setIsLoggingOut(false));
    };

    const items = [
        ...(showSettings
            ? [{
                key: "settings",
                label: labels.settings,
                icon: <FaGear />,
                onClick: handleSettings,
                testId: `${testId}-settings`,
            }]
            : []),
        ...extraItems,
        { key: "logout-divider", divider: true },
        {
            key: "logout",
            label: isLoggingOut ? labels.loggingOut : labels.logout,
            icon: <LuLogOut />,
            danger: true,
            disabled: isLoggingOut,
            onClick: handleLogout,
            testId: `${testId}-logout`,
        },
    ];

    // The visible name is the accessible name; without one, labels.account.
    const trigger = (
        <button { ...mergeProps("trigger", p => ({
            "aria-label": username ? undefined : labels.account,
            ...p,
            type: "button",
            "data-testid": `${testId}-trigger`,
            className: `flex items-center gap-app-xs rounded-app-md border border-border bg-soft-bg pl-app-xxs pr-app-xs py-app-xxs
                text-app-sm text-strong-text hover:bg-medium-bg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary`,
        }), { forwardAttributes: true })}>
            <span { ...mergeProps("avatar", p => ({
                ...p,
                "aria-hidden": "true",
                className: "flex items-center justify-center w-7 h-7 rounded-app-md bg-primary/10 text-primary text-app-xs font-app-bold shrink-0",
            }))}>
                {initials}
            </span>
            {username ? <span className="max-w-[160px] truncate">{username}</span> : null}
            <FaChevronDown aria-hidden="true" className="text-app-xs text-soft-text shrink-0" />
        </button>
    );

    return (
        <Dropdown { ...mergeProps("Dropdown", p => ({
            ...p,
            trigger,
            items,
            align,
            testId,
        }))} />
    );
};

UserMenu.propTypes = propTypes;
UserMenu.defaultProps = defaultProps;
