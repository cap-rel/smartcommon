import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Text = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Text", props);

    const { value } = variantProps;

    return (
        <div { ...mergeProps("text", props => ({
            ...props,
            className: `overflow-y-auto max-h-50`
        }))}>
            {value}
        </div>
    );
};

Text.propTypes = propTypes;