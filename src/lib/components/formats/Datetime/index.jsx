import { FaCalendarDays } from "react-icons/fa6";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

// Auto-detects between epoch seconds and epoch milliseconds: any timestamp
// above this threshold is treated as ms (would otherwise be year ~33658).
const MS_THRESHOLD = 1e12;

const toDate = (value) => {
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === "number") {
        return new Date(value < MS_THRESHOLD ? value * 1000 : value);
    }
    if (typeof value === "string") {
        return new Date(value);
    }
    return null;
};

export const Datetime = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Datetime", props);

    const { value, locale = "default", options = {} } = variantProps;

    if (isNil(value)) {
        return null;
    }

    const date = toDate(value);
    if (!date || globalThis.Number.isNaN(date.getTime())) {
        return null;
    }

    let formattedDatetime;
    try {
        formattedDatetime = new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
            ...options,
        }).format(date);
    } catch {
        formattedDatetime = date.toISOString();
    }

    return (
        <span { ...mergeProps("link", props => ({
            ...props,
            "data-component": "Datetime",
            className: `flex items-center gap-app-xs`,
        }))}>
            <span { ...mergeProps("icon", props => ({
                ...props,
                className: ``,
            }))}>
                <FaCalendarDays />
            </span>
            <span { ...mergeProps("datetime", props => ({
                ...props,
                className: `italic`,
            }))}>
                {formattedDatetime}
            </span>
        </span>
    );
};

Datetime.propTypes = propTypes;
