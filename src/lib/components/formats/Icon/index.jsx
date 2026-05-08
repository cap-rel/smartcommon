import { isValidElement, createElement } from "react";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

// Exported as `IconDisplay` to avoid collision with the form helper
// `form/tools/Icon` already in the public barrel.
export const IconDisplay = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("IconDisplay", props);

    const { value, icon, label, color, size } = variantProps;

    const iconNode = icon ?? value;

    if (isNil(iconNode)) {
        return null;
    }

    const renderedIcon = isValidElement(iconNode)
        ?   iconNode
        :   typeof iconNode === "function"
            ?   createElement(iconNode)
            :   null;

    if (renderedIcon === null) {
        return null;
    }

    const inlineStyle = {
        ...(color ? { color } : {}),
        ...(size ? { fontSize: typeof size === "number" ? `${size}px` : size } : {}),
    };

    return (
        <span { ...mergeProps("container", props => ({
            ...props,
            "data-component": "Icon",
            style: { ...inlineStyle, ...(props?.style ?? {}) },
            className: `inline-flex items-center gap-app-xs`,
        }))}>
            <span { ...mergeProps("icon", props => ({
                ...props,
                className: ``,
            }))}>
                {renderedIcon}
            </span>
            {label && (
                <span { ...mergeProps("label", props => ({
                    ...props,
                    className: ``,
                }))}>
                    {label}
                </span>
            )}
        </span>
    );
};

IconDisplay.propTypes = propTypes;
