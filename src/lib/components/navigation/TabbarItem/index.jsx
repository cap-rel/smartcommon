import { useVariantMerger } from "../../../hooks";
import { defaultProps, propTypes } from "./props";

export const TabbarItem = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("TabbarItem", props);

    const { 
        badge,
        icon,
        activeIcon,
        disabled = false,
        label,
        active
    } = variantProps;
          
    const currentIcon = active ? (activeIcon ? activeIcon : icon) : icon;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            ...mergeQuickProps(props, ["disabled", "to", "replace", "state", "onClick"]),
            className: `
                group flex-1 py-app-xs ${disabled && "pointer-events-none"}
                lg:flex-0 lg:p-app-xs lg:active:brightness-soft lg:rounded-app-md lg:duration-(--really-quick) lg:w-full ${active ? "lg:bg-primary" : "lg:bg-soft-bg"}
            `
        }))}>

            <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `
                    flex flex-col items-center gap-app-xxs
                    lg:flex-row lg:gap-app-xs
                `
            }))}>

                {icon && 
                    <div { ...mergeProps("icon", props => ({
                        ...props,
                        className: `
                            text-lg flex justify-center items-center py-app-xs px-app-md rounded-app-xl duration-(--really-quick) ${active ? "text-primary lg:text-white bg-primary/15" : "text-soft-text group-active:brightness-soft bg-soft-bg"}
                            lg:p-0 lg:bg-transparent
                        `
                    }))}>
                        {currentIcon()}
                    </div>
                }

                {label &&
                    <div { ...mergeProps("label", props => ({
                        ...props,
                        className: `
                            truncate text-app-xs ${active ? "text-primary lg:text-white" : "text-soft-text"}
                            lg:grow
                        `
                    }))}>
                        {label}
                    </div>
                }

            </div>

        </div>
    );
};

TabbarItem.propTypes = propTypes;
TabbarItem.defaultProps = defaultProps;
