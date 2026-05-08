import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Signature = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Signature", props);

    const { value } = variantProps;

    if (isNil(value)) {
        return null;
    }

    const src = typeof value === "string" ? value : value?.signature;
    if (!src) {
        return null;
    }

    const signer = typeof value === "object" ? value?.signer : undefined;

    return (
        <img { ...mergeProps("img", props => ({
            src,
            alt: signer ?? "signature",
            "data-component": "Signature",
            ...props,
        }))} />
    );
};

Signature.propTypes = propTypes;
