import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";

export const Text = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Text", props);

    const { value } = variantProps;

    return (
        <div { ...mergeProps("text", props => ({
            ...props,
            className: `border border-border overflow-y-auto max-h-50 p-app-sm`
        }))}>
            {value}
        </div>
    );
};

Text.propTypes = propTypes;