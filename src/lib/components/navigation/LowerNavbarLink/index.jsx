import { getVariable, isNil } from "../../../utils";
import { useVariantMerger } from "../../../hooks";

export const LowerNavbarLink = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("lowerNavbarLinks", props);

    const { to, icon, activeIcon, disabled, label, active: activeManually, Link } = variantProps;
                                                
    const isActive = !isNil(activeManually) ? activeManually : `${location.pathname}${location.search}` === to;
    const currentIcon = isActive ? (!isNil(activeIcon) ? activeIcon : icon) : icon;

    return (
        <Link { ...mergeProps("link", props => ({
            ...props,
            ...mergeQuickProps(props, ["disabled", "to", "state", "replace", "onClick"]),
            style: { transition: `filter ${getVariable("--really-quick")}, color ${getVariable("--medium")}, border-color ${getVariable("--medium")}` },
            className: `bg-primary text-app-sm snap-center px-app-base py-app-xs border-b-4
            font-app-base flex-1 ${disabled && "pointer-events-none"} whitespace-nowrap rounded-app-base border-primary
            ${isActive ? "text-white border-white font-app-semibold" : "font-app-base text-soft-text border-primary active:brightness-soft"}
            flex justify-center items-center gap-app-xs`
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
                
        </Link>
    );
    
}