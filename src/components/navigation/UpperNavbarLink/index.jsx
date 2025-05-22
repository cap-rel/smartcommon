import { Link } from "react-router-dom";
import { useVariantToProps } from "../../../hooks";
import { isNil } from "../../../globals";

// TODO badge

export const UpperNavbarLink = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("upperNavbarLink", props);
    
    const { badge, icon, disabled, label } = variantProps;
                                                                            
    return (
        <Link { ...mergeProps("link", props => ({
            ...props,
            ...mergeQuickProps(props, ["to", "state", "replace", "disabled", "onClick"]),
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

        </Link>
    );
}