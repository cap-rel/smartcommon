import { useId, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { isNil } from "lodash";

import { useNavigation, useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil, createLogger, formatBadgeCount, BADGE_CLASS_NAME } from "lib/utils";
import { LazyLink } from "lib/components/others/LazyLink";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

const logger = createLogger("DesktopSidebar");

// Collapse state persisted per browser ("1" / "0"), so it survives a reload.
const readCollapsed = (storageKey, fallback) => {
    if (!storageKey) return fallback;
    try {
        const stored = window.localStorage?.getItem(storageKey);
        if (stored === "1") return true;
        if (stored === "0") return false;
        return fallback;
    } catch (err) {
        logger.warn(`cannot read ${storageKey}, using the default collapse state`, err);
        return fallback;
    }
};

const writeCollapsed = (storageKey, collapsed) => {
    if (!storageKey) return;
    try {
        window.localStorage?.setItem(storageKey, collapsed ? "1" : "0");
    } catch (err) {
        logger.warn(`cannot store ${storageKey}, the collapse state will not survive a reload`, err);
    }
};

// "/" is active on "/" only; another route on itself and its sub-routes.
const matchRoute = (pathname, route) => {
    if (!route || !pathname) return false;
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route.replace(/\/$/, "")}/`);
};

const renderSlot = (slot, collapsed) => (typeof slot === "function" ? slot({ collapsed }) : slot);

/**
 * Persistent desktop sidebar: primary navigation on the left (the same
 * entries as the mobile Tabbar), collapsible to an icon rail. The collapse
 * state is kept in localStorage under `storageKey`, so it survives a reload;
 * pass `collapsed` + `onCollapsedChange` to own it instead.
 *
 * A `nav` landmark (labels.navigation) holding a list of links: a link with
 * `to` navigates through the router, without it is a button. The current
 * route's link gets aria-current="page". Collapsed, the labels hide and each
 * link keeps its name (aria-label, tooltip).
 *
 * links: { id?, label, icon, to?, onClick?, active?, badge?, disabled? }
 */
export const DesktopSidebar = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("DesktopSidebar", props);
    const {
        links = [],
        brand,
        footer,
        collapsed: collapsedProp,
        defaultCollapsed = false,
        onCollapsedChange,
        storageKey = "smartcommon.desktopSidebar.collapsed",
        isActive,
        labels: userLabels,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const nav = useNavigation();
    const pathname = nav.location?.pathname ?? window.location.pathname;

    const isControlled = collapsedProp !== undefined;
    const [storedCollapsed, setStoredCollapsed] = useState(() => readCollapsed(storageKey, defaultCollapsed));
    const collapsed = isControlled ? !!collapsedProp : storedCollapsed;

    const navId = `${useId()}-nav`;

    const toggle = () => {
        const next = !collapsed;
        if (!isControlled) {
            setStoredCollapsed(next);
            writeCollapsed(storageKey, next);
        }
        applyFunctionIfNotNil(onCollapsedChange, next);
    };

    const isLinkActive = (link) => {
        if (!isNil(link.active)) return !!link.active;
        if (typeof isActive === "function") return !!isActive(link, pathname);
        return matchRoute(pathname, link.to);
    };

    const renderLink = (link) => {
        const { label, icon, to, onClick, badge, disabled = false } = link;
        const active = isLinkActive(link);
        const Icon = icon;
        const badgeText = formatBadgeCount(badge);

        const linkProps = mergeProps("link", p => ({
            ...p,
            "aria-current": active ? "page" : undefined,
            // Collapsed, the visible label is gone: the link keeps its name.
            "aria-label": collapsed ? label : p["aria-label"],
            title: collapsed ? label : p.title,
            "data-testid": link.id ? `sidebar-nav-${link.id}` : p["data-testid"],
            onClick: (e) => {
                applyFunctionIfNotNil(p.onClick, e);
                applyFunctionIfNotNil(onClick, e);
            },
            className: `w-full flex items-center gap-2.5 rounded-app-md px-2.5 py-2 text-app-sm transition-colors outline-none
                focus-visible:ring-2 focus-visible:ring-primary ${
                active
                    ? "bg-primary/10 text-primary font-app-semibold"
                    : "text-medium-text hover:bg-medium-bg hover:text-strong-text"
            } ${collapsed ? "justify-center" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
        }));

        const content = (
            <>
                <span { ...mergeProps("iconGlyph", p => ({
                    ...p,
                    className: "relative inline-flex shrink-0 text-app-base",
                }))}>
                    {typeof Icon === "function" ? <Icon aria-hidden="true" /> : Icon}
                    {badgeText !== null ? (
                        <span { ...mergeProps("badge", p => ({
                            ...p,
                            "data-testid": "badge",
                            className: BADGE_CLASS_NAME,
                        }))}>
                            {badgeText}
                        </span>
                    ) : null}
                </span>
                {collapsed ? null : <span className="truncate">{label}</span>}
            </>
        );

        if (disabled || isNil(to)) {
            return (
                <button type="button" disabled={disabled} { ...linkProps }>
                    {content}
                </button>
            );
        }
        return (
            <LazyLink to={to} Link={linkProps}>
                {content}
            </LazyLink>
        );
    };

    return (
        <aside { ...mergeProps("aside", p => ({
            ...p,
            "data-component": "DesktopSidebar",
            "data-testid": p["data-testid"] ?? "desktop-sidebar",
            "data-collapsed": collapsed ? "true" : "false",
            className: `flex flex-col bg-soft-bg border-r border-border h-screen sticky top-0 transition-[width] duration-200 z-30 ${
                collapsed ? "w-16" : "w-56"
            }`,
        }), { forwardAttributes: true })}>
            {isNil(brand) ? null : (
                <div { ...mergeProps("brand", p => ({
                    ...p,
                    className: "flex items-center gap-2 px-3 h-14 shrink-0",
                }))}>
                    {renderSlot(brand, collapsed)}
                </div>
            )}

            <nav { ...mergeProps("nav", p => ({
                "aria-label": labels.navigation,
                ...p,
                id: navId,
                className: "flex-1 overflow-y-auto py-2 px-2",
            }))}>
                <ul className="flex flex-col gap-0.5">
                    {(links ?? []).map((link, index) => (
                        <li key={link.id ?? link.to ?? index}>
                            {renderLink(link)}
                        </li>
                    ))}
                </ul>
            </nav>

            <div { ...mergeProps("footer", p => ({
                ...p,
                className: "border-t border-border px-2 py-2 shrink-0",
            }))}>
                {isNil(footer) ? null : renderSlot(footer, collapsed)}
                <button { ...mergeProps("toggle", p => ({
                    ...p,
                    type: "button",
                    "aria-expanded": !collapsed,
                    "aria-controls": navId,
                    "aria-label": collapsed ? labels.expand : undefined,
                    title: collapsed ? labels.expand : undefined,
                    "data-testid": "desktop-sidebar-toggle",
                    onClick: (e) => {
                        applyFunctionIfNotNil(p.onClick, e);
                        toggle();
                    },
                    className: `w-full flex items-center gap-2.5 rounded-app-md px-2.5 py-2 text-app-sm text-soft-text hover:bg-medium-bg
                        hover:text-strong-text transition-colors mt-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        collapsed ? "justify-center" : ""
                    }`,
                }))}>
                    {collapsed
                        ? <FaChevronRight aria-hidden="true" className="text-app-xs" />
                        : <FaChevronLeft aria-hidden="true" className="text-app-xs" />}
                    {collapsed ? null : <span>{labels.collapse}</span>}
                </button>
            </div>
        </aside>
    );
};

DesktopSidebar.propTypes = propTypes;
DesktopSidebar.defaultProps = defaultProps;
