import { Link, useLocation } from "react-router-dom";
import { isNil } from "../../../globals/functions";

import { propTypes } from "./props";
import { tabbarLinkVariants } from "./variants";
import { mergeProps } from "../../../globals/functions/variant";

export const TabbarLink = ({
    icon,
    activeIcon,
    label,
    disabled,
    variant = "classic",
    linkProps,
    iconAndLabelContainerProps,
    iconContainerProps,
    labelProps,
    ...props
}) => {
    const linkPs = { ...props, ...linkProps };

    const { to } = linkPs;

    const location = useLocation();
    const isActive = location.pathname === to;
    const currentIcon = isActive ? (activeIcon ?? icon) : icon;

    const params = { isActive };

    return (
        <Link
            { ...mergeProps(
                {}, `flex-1 py-2`,
                linkPs, tabbarLinkVariants, variant, "linkProps", params
            )}
        >
            <div
                { ...mergeProps(
                    {}, `col items-center gap-1`,
                    iconAndLabelContainerProps, tabbarLinkVariants, variant, "iconAndLabelContainerProps", params
                )}
            >
                {!isNil(icon) && 
                    <div
                        { ...mergeProps(
                            {}, `text-xl row justify-center items-center ${isActive ? "text-primary" : "text-stronger"}`,
                            iconContainerProps, tabbarLinkVariants, variant, "iconContainerProps", params
                        )}
                    >
                        {currentIcon}
                    </div>
                }
                {!isNil(label) &&
                    <div
                        { ...mergeProps(
                            {}, `truncate text-xs ${isActive ? "text-primary" : "text-stronger"}`,
                            labelProps, tabbarLinkVariants, variant, "labelProps", params
                        )}
                    >
                        {label}
                    </div>
                }
            </div>
        </Link>
    );
};

TabbarLink.propTypes = propTypes;