import { FaCalendarDays } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";
import { isNil } from "lib/utils";

import { propTypes } from "./props";

export const Datetime = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Datetime", props);

    const { value, locale = "default", options = {} } = variantProps;

    let formattedDatetime = "";

    if (!isNil(value)) {
        formattedDatetime = new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
            ...options
        }).format(new Date(value * 1000));
    }

    return (
        <a { ...mergeProps("link", props => ({
            // href: `mailto:${value}`,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft active:underline`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaCalendarDays />
            </div>
            <div { ...mergeProps("datetime", props => ({
                ...props,
                className: `italic`
            }))}>
                {value}
            </div>
        </a>
    );
};

Datetime.propTypes = propTypes;