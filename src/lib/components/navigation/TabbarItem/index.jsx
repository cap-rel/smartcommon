import { useVariantMerger } from "lib/hooks";
import { formatBadgeCount, BADGE_CLASS_NAME, twMerge } from "lib/utils";

import { defaultProps, propTypes } from "./props";

export const TabbarItem = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("TabbarItem", props);

    const { 
        id,
        responsive = true,
        badge,
        icon,
        activeIcon,
        disabled = false,
        label,
        active,
        onClick = () => {} 
    } = variantProps;
          
    const currentIcon = active ? (activeIcon ? activeIcon : icon) : icon;

    // Counter badge: hidden for 0 / empty, capped at "99+". It is pinned to
    // the corner of the icon glyph, not of the padded pill around it: on a
    // 412 px phone with five tabs (82 px each) the pill is 66 px wide, and a
    // badge centred on its right edge overflowed the last tab, and the
    // screen, by up to 6 px. On the glyph it stays some 18 px inside the tab.
    // Without an icon it sits inside the tab's top-right corner instead of
    // straddling the tab edge.
    const badgeText = formatBadgeCount(badge);
    const badgeElement = badgeText !== null && (
        <span { ...mergeProps("badge", props => ({
            ...props,
            "data-testid": "badge",
            className: icon ? BADGE_CLASS_NAME : twMerge(BADGE_CLASS_NAME, "translate-x-0")
        }))}>
            {badgeText}
        </span>
    );

    // A tab navigates: exposed as a link, reachable with Tab and activated with
    // Enter like a native link. `disabled` only blocked the pointer before; the
    // keyboard is blocked here too.
    const handleClick = (e) => {
        if (disabled) {
            return;
        }
        onClick(e);
    };

    return (
        <div { ...mergeProps("container", props => ({
            role: "link",
            tabIndex: disabled ? -1 : 0,
            "aria-current": active ? "page" : undefined,
            "aria-disabled": disabled ? "true" : undefined,
            ...props,
            className: `
                group flex-1 py-app-xs cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-app-md
                ${disabled ? "pointer-events-none" : ""}
                ${responsive ? `lg:flex-0 lg:p-app-xs lg:active:brightness-soft lg:rounded-app-md lg:duration-(--really-quick) lg:w-full ${active ? "lg:bg-primary" : "lg:bg-soft-bg"}` : ""}
            `,
            onClick: handleClick,
            onKeyDown: (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleClick(e);
                }
                props.onKeyDown?.(e);
            }
        }), { forwardAttributes: true })}>

            <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `
                    relative flex flex-col items-center gap-app-xxs
                    ${responsive ? "lg:flex-row lg:gap-app-xs" : ""}
                `
            }))}>

                {icon &&
                    <div { ...mergeProps("icon", props => ({
                        ...props,
                        className: `
                            relative text-lg flex justify-center items-center py-app-xs px-app-md rounded-app-xl duration-(--really-quick) ${active ? "text-primary lg:text-white bg-primary/15" : "text-soft-text group-active:brightness-soft bg-soft-bg"}
                            ${responsive ? "lg:p-0 lg:bg-transparent" : ""}
                        `
                    }))}>
                        <span { ...mergeProps("iconGlyph", props => ({
                            ...props,
                            className: `relative inline-flex`
                        }))}>
                            {typeof currentIcon === 'function' ? currentIcon() : currentIcon}
                            {badgeElement}
                        </span>
                    </div>
                }

                {!icon && badgeElement}

                {label &&
                    <div { ...mergeProps("label", props => ({
                        ...props,
                        className: `
                            truncate text-app-xs ${active ? "text-primary lg:text-white" : "text-soft-text"}
                            ${responsive ? "lg:grow" : ""}
                        `
                    }))}>
                        {label}
                    </div>
                }

            </div>

        </div>
    );
};

TabbarItem.propTypes = propTypes;
TabbarItem.defaultProps = defaultProps;
