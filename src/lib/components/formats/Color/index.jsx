import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Color = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Color", props);

    const { value } = variantProps;

    return (
        <div { ...mergeProps("color", props => ({
            ...props,
            style: { "--color": value },
            className: `size-6 rounded-full border border-border bg-(--color)`
        }))} />
    );
};

Color.propTypes = propTypes;