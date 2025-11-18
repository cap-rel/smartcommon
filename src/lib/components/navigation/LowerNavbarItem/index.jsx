import { applyFunctionIfFunction, getVariable } from "lib/utils";
import { useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

export const LowerNavbarItem = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("LowerNavbarLinks", props);

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
                                                
    return (
        <div { ...mergeProps("container", props => ({
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
                ${disabled && "pointer-events-none"}
                ${active ? "text-white border-white font-app-semibold" : "font-app-base text-soft-text border-primary active:brightness-soft"}
                lg:bg-transparent lg:cursor-pointer lg:border-b-2
                ${active ? "lg:text-strong-text lg:border-primary" : "border-transparent lg:border-border"}
            `,
            onClick: e => {
                if (props.onClick) {
                    return applyFunctionIfFunction(props.onClick(), e);
                }
                onClick();
            }
        }))}>
            {/* border-b-4 */}

            {icon && 
                <div { ...mergeProps("icon", props => props)}>
                    {currentIcon()}
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