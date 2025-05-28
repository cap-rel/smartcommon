import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";
import { isNil } from "../../../globals";

export const Datetime = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Datetime", props);

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
        <div { ...mergeProps("datetime", props => ({
            ...props,
            className: `italic`
        }))} >
            {formattedDatetime}
        </div>
    );
};

Datetime.propTypes = propTypes;