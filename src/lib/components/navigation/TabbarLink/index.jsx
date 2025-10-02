import { isNil } from "../../../utils";
import { useVariantMerger } from "../../../hooks";

export const TabbarLink = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("tabbarLink", props);

    const { badge, icon, activeIcon, disabled, label, active: activeManually, to, Link } = variantProps;
          
    const active = !isNil(activeManually) ? activeManually : `${location.pathname}${location.search}` === to;
    const currentIcon = active ? (!isNil(activeIcon) ? activeIcon : icon) : icon;

    return (
        <Link { ...mergeProps("link", props => ({
            ...props,
            ...mergeQuickProps(props, ["disabled", "to", "replace", "state", "onClick"]),
            className: `group flex-1 py-app-xs ${disabled && "pointer-events-none"}`
        }))}>

            <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `flex flex-col items-center gap-app-xxs`
            }))}>

                {!isNil(icon) && 
                    <div { ...mergeProps("icon", props => ({
                        ...props,
                        className: `text-lg flex justify-center items-center py-app-xs px-app-md rounded-app-xl duration-(--really-quick) ${active ? "text-primary  bg-primary/15" : "text-soft-text group-active:brightness-soft bg-soft-bg"}`
                    }))}>
                        {currentIcon}
                    </div>
                }

                {!isNil(label) &&
                    <div { ...mergeProps("label", props => ({
                        ...props,
                        className: `truncate text-app-xs ${active ? "text-primary" : "text-soft-text"}`
                    }))}>
                        {label}
                    </div>
                }

            </div>

        </Link>
    );
}