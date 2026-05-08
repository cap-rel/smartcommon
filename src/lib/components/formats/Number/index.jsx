import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Number = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Number", props);

    const {
        value,
        locale = "default",
        style = "decimal",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
        options = {},
    } = variantProps;

    if (isNil(value) || value === "") {
        return null;
    }

    const numericValue = typeof value === "number" ? value : parseFloat(value);
    if (globalThis.Number.isNaN(numericValue)) {
        return null;
    }

    const formatOptions = {
        style,
        ...(style === "currency" && currency ? { currency } : {}),
        ...(minimumFractionDigits !== undefined ? { minimumFractionDigits } : {}),
        ...(maximumFractionDigits !== undefined ? { maximumFractionDigits } : {}),
        ...options,
    };

    let formatted;
    try {
        formatted = new Intl.NumberFormat(locale, formatOptions).format(numericValue);
    } catch {
        formatted = String(numericValue);
    }

    return (
        <span { ...mergeProps("number", props => ({
            ...props,
            "data-component": "Number",
            className: ``,
        }))}>
            {formatted}
        </span>
    );
};

Number.propTypes = propTypes;
