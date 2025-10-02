import { useVariantMerger } from "../../../hooks";
import { isNil } from "../../../utils";

// TODO badge

export const UpperNavbarLink = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("UpperNavbarLink", props);
    
    const { badge, icon, disabled, label, children } = variantProps;
                                                                            
    return (
        <div { ...mergeProps("link", props => ({
            ...props,
            ...mergeQuickProps(props, ["onClick"]),
            className: `flex items-center gap-app-xs bg-primary text-white px-app-xs py-app-xs text-app-lg rounded-app-xl active:brightness-soft ${disabled && "pointer-events-none"}`
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

        </div>
    );
}