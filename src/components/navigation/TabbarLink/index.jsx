import { Link, useLocation } from "react-router-dom";
import { isNil } from "../../../globals/functions";

import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";

// icon,
// activeIcon,
// label,
// disabled,
// variant = "smart",
// linkProps,
// iconAndLabelContainerProps,
// iconContainerProps,
// labelProps,

export const TabbarLink = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("tabbarLink", props);

    const { icon, activeIcon, disabled, label, Link: LinkProps = {} } = variantProps;

    const { to } = LinkProps;

    const location = useLocation();
    const isActive = `${location.pathname}${location.search}` === to;
    const currentIcon = isActive ? (activeIcon ?? icon) : icon;

    return (
        <Link { ...mergeProps("Link", props => ({
            ...props,
            className: `flex-1 py-app-sm ${disabled && "pointer-events-none"}`
        }))}>
            <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `flex flex-col items-center gap-app-xxs`
            }))}>
                {!isNil(icon) && 
                    <div { ...mergeProps("icon", props => ({
                        ...props,
                        className: `text-lg flex justify-center items-center ${isActive ? "text-primary" : "text-soft-text"}`
                    }))}>
                        {currentIcon}
                    </div>
                }
                {!isNil(label) &&
                    <div { ...mergeProps("label", props => ({
                        ...props,
                        className: `truncate text-app-xs ${isActive ? "text-primary" : "text-soft-text"}`
                    }))}>
                        {label}
                    </div>
                }
            </div>
        </Link>
    );
};

TabbarLink.propTypes = propTypes;