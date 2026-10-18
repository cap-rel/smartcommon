import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";

import { propTypes } from "./props";

// TODO badge

export const UpperNavbarItem = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("UpperNavbarItem", props);

    const {
        id,
        badge,
        icon,
        disabled,
        label,
        onClick,
        children
    } = variantProps;

    return (
        <div { ...mergeProps("link", props => ({
            ...props,
            // A top-level onClick used to be dropped silently (only
            // linkProps.onClick reached the element); chain both now.
            onClick: e => {
                if (props.onClick) {
                    props.onClick(e);
                }
                applyFunctionIfNotNil(onClick, e);
            },
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
