import { Label } from "..";
import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { isNil } from "../../../globals/functions";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";

// {
//     label,
//     labelRow = false,
//     help,
//     onValueChange = () => {},
  
//     containerProps,
//     labelContainerProps,
//     labelProps,
//     requiredStarProps,
//     helpProps,
//     inputContainerProps,
//     inputProps,
//     valueProps,
//     ...props
//   }

export const RangeInput = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("RangeInput", props);
    
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
            <div { ...mergeProps("rangeContainer", props => ({
                ...props,
                className: `gap-2 row-v-center`
            }))}>
                <input { ...mergeProps("input", props => ({
                    name: name,
                    ...props,
                    type: "range",
                    onChange: handleColorOnChange,
                    value: currentValue,
                    className: `flex-grow w-full bg-transparent appearance-none accent-primary cursor-ew-resize`,
                }))} />
                <div { ...mergeProps("value", props => props)}>
                    {currentValue}
                </div>
            </div>
        </Label>
    );  
};

RangeInput.propTypes = propTypes;