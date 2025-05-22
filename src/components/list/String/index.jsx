import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";

export const String = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("String", props);

    const { value, underline, uppercase, italic, bold } = variantProps;

    return (
        <div { ...mergeProps("string", props => ({
            ...props,
            className: `
                ${underline && "underline"}
                ${uppercase && "uppercase"}
                ${italic && "italic"}
                ${bold && "font-app-semibold"}
            `
        }))}>
            {value}
        </div>
    );
};

String.propTypes = propTypes;