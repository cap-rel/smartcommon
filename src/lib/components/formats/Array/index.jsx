import { isArray, isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

// IMPORTANT: this component is named `Array`, which shadows the JS
// global. Inside this file, do NOT write `Array(...)`, `Array.from(...)`
// or `Array.isArray(...)`. Use lodash (`isArray`) or `globalThis.Array.*`.
// See eslint-rules/no-shadowed-global-self-call.js and
// src/lib/tests/globalShadowing.test.jsx for the guard rails.

const defaultFormatItem = (item) => {
    if (item == null) return "";
    if (typeof item === "string") return item;
    if (typeof item === "number") return globalThis.String(item);
    if (item.fullname) return item.fullname;
    if (item.firstname || item.lastname) {
        return [item.firstname, item.lastname].filter(Boolean).join(" ");
    }
    if (item.code) return item.code;
    if (item.label) return item.label;
    if (item.email) return item.email;
    return "";
};

export const Array = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Array", props);

    const {
        value,
        formatItem = defaultFormatItem,
        separator = ", ",
    } = variantProps;

    const safeValue = isNil(value) ? [] : isArray(value) ? value : [value];

    const formatted = safeValue
        .map((item) => formatItem(item) ?? "")
        .filter((s) => s !== "")
        .join(separator);

    return (
        <span { ...mergeProps("container", p => ({
            ...p,
            "data-component": "Array",
        }))}>
            {formatted}
        </span>
    );
};

Array.propTypes = propTypes;
