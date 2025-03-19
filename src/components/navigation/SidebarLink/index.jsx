import { isEmpty } from "../../../globals/functions";
import { LazyLink } from "../../others";
import { twMerge } from "tailwind-merge";
import { propTypes } from "./props";

export const SidebarLink = ({
    icon,
    label,
    closeSidebar = () => {},
    lazyLinkProps,
    iconProps,
    labelProps,
    ...props
}) => {
    const lazyLinkPs = { ...props, ...lazyLinkProps };

    return (
        <LazyLink
            duration={300}
            { ...lazyLinkPs}
            onClick={closeSidebar}
            className={twMerge(`gap-1 px-6 py-3 duration-100 active:brightness-soft col-full-center bg-strong max-w-40`, lazyLinkPs?.className)}
        >
            {!isEmpty(icon) && 
                <div
                    { ...iconProps}
                    className={twMerge(`p-4 bg-primary rounded-md text-white text-3xl shrink-0`, iconProps?.className)}
                >
                    {icon}
                </div>
            }
            {!isEmpty(label) &&
                <div 
                    { ...labelProps}
                    className={twMerge(`text-sm font-semibold truncate text-soft-text`, labelProps?.className)}
                >
                    {label}
                </div>
            }
        </LazyLink>
    );
};

SidebarLink.propTypes = propTypes;