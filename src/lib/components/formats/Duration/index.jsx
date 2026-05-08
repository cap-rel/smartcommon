import { isNil, isPlainObject } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { secsToDuration } from "lib/utils";

import { propTypes } from "./props";

const fallbackFormat = ({ days, hours, minutes, seconds }) => {
    const parts = [];
    if (days) parts.push(`${days} j`);
    if (hours || days) parts.push(`${hours} h`);
    if (minutes || hours || days) parts.push(`${minutes} min`);
    parts.push(`${seconds} s`);
    return parts.join(" ");
};

const intlSupported = () => typeof Intl !== "undefined" && typeof Intl.DurationFormat === "function";

export const Duration = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Duration", props);

    const {
        value,
        locale = "default",
        style = "narrow",
        options = {},
    } = variantProps;

    if (isNil(value)) {
        return null;
    }

    let duration;
    if (isPlainObject(value)) {
        duration = value;
    } else {
        const numericValue = typeof value === "number" ? value : parseFloat(value);
        if (globalThis.Number.isNaN(numericValue)) {
            return null;
        }
        duration = secsToDuration(numericValue);
    }

    let formatted;
    if (intlSupported()) {
        try {
            formatted = new Intl.DurationFormat(locale, { style, ...options }).format(duration);
        } catch {
            formatted = fallbackFormat(duration);
        }
    } else {
        formatted = fallbackFormat(duration);
    }

    return (
        <span { ...mergeProps("duration", props => ({
            ...props,
            "data-component": "Duration",
            className: `italic`,
        }))}>
            {formatted}
        </span>
    );
};

Duration.propTypes = propTypes;
