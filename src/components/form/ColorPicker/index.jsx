import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../tools/Label";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

// TODO tailwind color

export const ColorPicker = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("ColorPicker", props);

    const { extractedLabelProps, filteredProps } = useLabel(variantProps);

    const {
        id,
        name,
        defaultValue,
        value,
        onChange
    } = filteredProps;

    const { currentValue, setValue } = useValue(defaultValue ?? null, value, onChange);

    const handleColorOnChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
    };

    return (
        <Label 
            { ...extractedLabelProps}
            mergeProps={mergeProps}
        >
            <input { ...mergeProps("input", props => ({
                name: name,
                ...props,
                type: "color",
                onChange: handleColorOnChange,
                value: currentValue,
                className: `size-6 border-border`,
            }))}
               
            />
        </Label>
    );
};

ColorPicker.propTypes = propTypes;