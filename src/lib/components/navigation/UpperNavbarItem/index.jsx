import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil, formatBadgeCount, BADGE_CLASS_NAME } from "lib/utils";

import { propTypes } from "./props";

export const UpperNavbarItem = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("UpperNavbarItem", props);

    const {
        id,
        badge,
        icon,
        disabled,
        label,
        onClick,
        children
    } = variantProps;

    // Counter badge: hidden for 0 / empty, capped at "99+".
    const badgeText = formatBadgeCount(badge);

    return (
        <div { ...mergeProps("link", props => ({
            ...props,
            // linkProps.onClick runs first, then the top-level onClick: both
            // fire, neither replaces the other.
            onClick: e => {
                if (props.onClick) {
                    props.onClick(e);
                }
                applyFunctionIfNotNil(onClick, e);
            },
            className: `relative flex items-center gap-app-xs bg-primary text-white px-app-xs py-app-xs text-app-lg rounded-app-xl active:brightness-soft ${disabled ? "pointer-events-none" : ""}`
        }))}>

            {!isNil(icon) &&
                <div { ...mergeProps("icon", props => props)}>
                    {icon}
                </div>
            }

            {!isNil(label) &&
                <div { ...mergeProps("label", props => props)}>
                    {label}
                </div>
            }

            {children}

            {!isNil(badgeText) &&
                <span { ...mergeProps("badge", props => ({
                    ...props,
                    "data-testid": "badge",
                    className: BADGE_CLASS_NAME
                }))}>
                    {badgeText}
                </span>
            }

        </div>
    );
};

UpperNavbarItem.propTypes = propTypes;
