import { Link, useLocation } from "react-router-dom";
import { isNil } from "../../../globals/functions";

import { tabbarLinkPropTypes } from "./props";
import { tabbarLinkVariants } from "./variants";
import { mergeProps } from "../../../globals/functions/variant";

export const TabbarLink = ({
    icon,
    activeIcon,
    label,
    disabled,
    variant = "smart",
    linkProps,
    iconAndLabelContainerProps,
    iconContainerProps,
    labelProps,
    ...props
}) => {
    const linkPs = { ...props, ...linkProps };

    const { to } = linkPs;

    const location = useLocation();
    const isActive = `${location.pathname}${location.search}` === to;
    const currentIcon = isActive ? (activeIcon ?? icon) : icon;

    const propsParams = { isActive, disabled };

    return (
        <Link
            { ...mergeProps(
                {}, `flex-1 py-2 ${disabled && "pointer-events-none"}`,
                linkPs, tabbarLinkVariants, variant, "linkProps", propsParams
            )}
        >
            <div
                { ...mergeProps(
                    {}, `col items-center gap-1`,
                    iconAndLabelContainerProps, tabbarLinkVariants, variant, "iconAndLabelContainerProps", propsParams
                )}
            >
                {!isNil(icon) && 
                    <div
                        { ...mergeProps(
                            {}, `text-xl row justify-center items-center ${isActive ? "text-primary" : "text-soft-text"}`,
                            iconContainerProps, tabbarLinkVariants, variant, "iconContainerProps", propsParams
                        )}
                    >
                        {currentIcon}
                    </div>
                }
                {!isNil(label) &&
                    <div
                        { ...mergeProps(
                            {}, `truncate text-xs ${isActive ? "text-primary" : "text-soft-text"}`,
                            labelProps, tabbarLinkVariants, variant, "labelProps", propsParams
                        )}
                    >
                        {label}
                    </div>
                }
            </div>
        </Link>
    );
};

TabbarLink.propTypes = tabbarLinkPropTypes;