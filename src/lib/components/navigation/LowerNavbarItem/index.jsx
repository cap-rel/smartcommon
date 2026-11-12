import { applyFunctionIfFunction, getVariable } from "lib/utils";
import { useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

export const LowerNavbarItem = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("LowerNavbarItem", props);

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

    // An item navigates: exposed as a link, reachable with Tab and activated
    // with Enter like a native link. `disabled` blocks pointer and keyboard.
    const activate = (e, containerOnClick) => {
        if (disabled) {
            return undefined;
        }
        if (containerOnClick) {
            return applyFunctionIfFunction(containerOnClick, e);
        }
        return onClick(e);
    };

    return (
        <div { ...mergeProps("container", props => ({
            role: "link",
            tabIndex: disabled ? -1 : 0,
            "aria-current": active ? "page" : undefined,
            "aria-disabled": disabled ? "true" : undefined,
            ...props,
            style: { 
                transition: `
                    filter ${getVariable("--really-quick")},
                    color ${getVariable("--medium")},
                    border-color ${getVariable("--medium")}
                `
            },
            className: `
                bg-primary text-app-sm snap-center px-app-base py-app-xs border-b-4 flex justify-center items-center gap-app-xs flex-1 whitespace-nowrap rounded-app-base border-primary
                cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white lg:focus-visible:ring-primary
                ${disabled ? "pointer-events-none" : ""}
                ${active ? "text-white border-white font-app-semibold" : "font-app-base text-soft-text border-primary active:brightness-soft"}
                lg:bg-transparent lg:cursor-pointer lg:border-b-2
                ${active ? "lg:text-strong-text lg:border-primary" : "border-transparent lg:border-border"}
            `,
            onClick: e => activate(e, props.onClick),
            onKeyDown: e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    activate(e, props.onClick);
                }
                props.onKeyDown?.(e);
            }
        }), { forwardAttributes: true })}>
            {/* border-b-4 */}

            {icon &&
                <div { ...mergeProps("icon", props => props)}>
                    {typeof currentIcon === 'function' ? currentIcon() : currentIcon}
                </div>
            }

            {label &&
                <div { ...mergeProps("label", props => props)}>
                    {label}
                </div>
            }
                
        </div>
    );
    
};

LowerNavbarItem.propTypes = propTypes;
LowerNavbarItem.defaultProps = defaultProps;