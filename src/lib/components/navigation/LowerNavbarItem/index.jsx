import { getVariable, isNil } from "../../../utils";
import { useVariantMerger } from "../../../hooks";
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
            ...mergeQuickProps(props, ["disabled", "to", "state", "replace", "onClick"]),
            style: { transition: `filter ${getVariable("--really-quick")}, color ${getVariable("--medium")}, border-color ${getVariable("--medium")}` },
            className: `bg-primary text-app-sm snap-center px-app-base py-app-xs border-b-4
            font-app-base flex-1 ${disabled && "pointer-events-none"} whitespace-nowrap rounded-app-base border-primary
            ${active ? "text-white border-white font-app-semibold" : "font-app-base text-soft-text border-primary active:brightness-soft"}
            flex justify-center items-center gap-app-xs`,
            onClick
        }))}>
            {/* border-b-4 */}

            {!isNil(icon) && 
                <div { ...mergeProps("icon", props => props)}>
                    {currentIcon}
                </div>
            }

            {!isNil(label) &&
                <div { ...mergeProps("label", props => props)}>
                    {label}
                </div>
            }
                
        </div>
    );
    
};

LowerNavbarItem.propTypes = propTypes;
LowerNavbarItem.defaultProps = defaultProps;