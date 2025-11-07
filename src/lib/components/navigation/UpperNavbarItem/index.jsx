import { useVariantMerger } from "../../../hooks";
import { isNil } from "../../../utils";
import { propTypes } from "./props";

// TODO badge

export const UpperNavbarItem = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("UpperNavbarLink", props);
    
    const { 
        id,
        badge,
        icon,
        disabled,
        label,
        children
    } = variantProps;
                                                                            
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
};

UpperNavbarItem.propTypes = propTypes;
UpperNavbarItem.defaultProps = propTypes;