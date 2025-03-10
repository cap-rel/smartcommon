import { useMemo } from "react";
import { Label, Select } from "../../form";
import { Icon } from "../../others";
import { useStates } from "../../../hooks";
import { isNil, isUndefined } from "../../../globals/functions";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";

export const Range = ({
    label,
    labelRow = false,
    help,
    onValueChange = () => {},
  
    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputContainerProps,
    inputProps,
    valueProps,
    ...props
  }) => {
    const inputPs = { ...props, ...inputProps };
  
    const { required, readOnly, disabled, id, value, defaultValue } = inputPs;
  
    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };
  
    const { states, set } = useStates({
      localValue: defaultValue ?? 0
    });
  
    const { localValue } = states;
  
    const realValue = value ?? localValue;

    const handleInputOnChange = (e) => {
        const newValue = e.target.value;

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue);
        }
    }

    return (
        <Label { ...allLabelPs}>
            <div
                { ...inputContainerProps}
                className={twMerge(`gap-2 row-v-center`, inputContainerProps?.className)}
            >
                <input
                    { ...inputPs}
                    type={`range`}
                    value={realValue}
                    onChange={handleInputOnChange}
                    className={`flex-grow w-full bg-transparent appearance-none accent-primary cursor-ew-resize`}
                />
                <div
                    { ...valueProps}
                    className={twMerge(``, valueProps?.className)}
                >
                    {realValue}
                </div>
            </div>
        </Label>
    );  
};

Range.propTypes = propTypes;