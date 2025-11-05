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
            className: `group flex-1 py-app-xs ${disabled && "pointer-events-none"}`
        }))}>

            <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `flex flex-col items-center gap-app-xxs`
            }))}>

                {icon && 
                    <div { ...mergeProps("icon", props => ({
                        ...props,
                        className: `text-lg flex justify-center items-center py-app-xs px-app-md rounded-app-xl duration-(--really-quick) ${active ? "text-primary  bg-primary/15" : "text-soft-text group-active:brightness-soft bg-soft-bg"}`
                    }))}>
                        {currentIcon()}
                    </div>
                }

                {label &&
                    <div { ...mergeProps("label", props => ({
                        ...props,
                        className: `truncate text-app-xs ${active ? "text-primary" : "text-soft-text"}`
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
