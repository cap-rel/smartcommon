import { FaArrowLeft } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";
import { UserMenu } from "lib/components/navigation/UserMenu";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

/**
 * Standard top bar of a desktop page: optional back button, title (h1) with
 * subtitle and breadcrumb on the left, a search slot in the middle, page
 * actions then the UserMenu on the right.
 *
 * Desktop UI conventions: separated by a bottom border, no shadow, tight
 * density. `shrink-0`: put it above a `flex-1 min-h-0` body.
 */
export const DesktopHeader = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("DesktopHeader", props);
    const {
        title,
        subtitle,
        breadcrumb,
        onBack,
        search,
        actions,
        showUserMenu = true,
        labels: userLabels,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    return (
        <header { ...mergeProps("header", p => ({
            ...p,
            "data-component": "DesktopHeader",
            className: "shrink-0 flex items-center gap-app-base border-b border-border bg-soft-bg px-app-base py-app-xs min-h-[56px]",
        }), { forwardAttributes: true })}>
            <div className="flex items-center gap-app-sm min-w-0">
                {onBack ? (
                    <button { ...mergeProps("backButton", p => ({
                        "aria-label": labels.back,
                        title: labels.back,
                        ...p,
                        type: "button",
                        "data-testid": "desktop-header-back",
                        onClick: (e) => {
                            applyFunctionIfNotNil(p.onClick, e);
                            onBack(e);
                        },
                        className: `flex items-center justify-center w-9 h-9 rounded-app-md text-medium-text hover:bg-medium-bg hover:text-strong-text
                            transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary`,
                    }))}>
                        <FaArrowLeft aria-hidden="true" className="text-app-base" />
                    </button>
                ) : null}
                <div className="min-w-0">
                    <div className="flex items-center gap-app-sm min-w-0">
                        <h1 { ...mergeProps("title", p => ({
                            ...p,
                            className: "text-app-lg font-app-bold text-strong-text truncate",
                        }))}>
                            {title}
                        </h1>
                        {subtitle ? (
                            <span { ...mergeProps("subtitle", p => ({
                                ...p,
                                className: "text-app-sm text-soft-text truncate",
                            }))}>
                                {subtitle}
                            </span>
                        ) : null}
                    </div>
                    {breadcrumb ? <div className="mt-0.5">{breadcrumb}</div> : null}
                </div>
            </div>

            {search ? (
                <div { ...mergeProps("search", p => ({
                    ...p,
                    className: "flex-1 min-w-0 max-w-[420px] mx-auto",
                }))}>
                    {search}
                </div>
            ) : null}

            <div { ...mergeProps("actions", p => ({
                ...p,
                className: "flex items-center gap-app-xs ml-auto shrink-0",
            }))}>
                {actions}
                {showUserMenu ? <UserMenu { ...mergeProps("UserMenu", p => p)} /> : null}
            </div>
        </header>
    );
};

DesktopHeader.propTypes = propTypes;
DesktopHeader.defaultProps = defaultProps;
