import { isNil, isNumber, secsToDuration } from "../../../globals/functions";
import { Input, Label } from "../../form";
import { twMerge } from "tailwind-merge";
import { useStates, useValue } from "../../../hooks";

import { durationPropTypes } from "./props";
import { durationVariants } from "./variants";

export const Duration = ({
    id,
    label,
    help,
    icon,
    prefix,
    suffix,
    hasCopyButton = false,
    required,
    readOnly,
    disabled,
    pattern,
    patternMessage,
    min,
    max,

    name,
    defaultValue,
    value,
    onValueChange = () => {},

    variant,

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    childrenContainerProps,
    prefixProps,
    suffixProps,
    inputsProps,
    durationContainerProps,
    ...props
}) => {
    const inputsPs = { ...props, ...inputsProps };
  
    const labelPs = { id, label, help, disabled, required, prefix, suffix, readOnly, variants: durationVariants, variant, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, childrenContainerProps, prefixProps, suffixProps };  

    const units = {
        days: { label: "Jours", seconds: 60 * 60 * 24, max: 9999 },
        hours: { label: "Heures", seconds: 60 * 60, max: 23 },
        minutes: { label: "Minutes", seconds: 60, max: 59 },
        seconds: { label: "Secondes", seconds: 1,  max: 59 }
    };

    const formatUnit = (number) => {
        return `0${number}`.slice(-2);
    }

    const { states, set } = useStates({
        isInputFocused: false,
    });

    const { isInputFocused } = states;

    const { currentValue, setValue } = useValue(defaultValue ?? 0, value, onValueChange);

    const handleInputOnChange = (unitKey, unitValue) => {
        const numberValue = isNumber(Number(unitValue)) ? Number(unitValue) : 0; 
        const unit = units[unitKey];
        if (numberValue <= unit.max) {
            const unitLastValue = secsToDuration(currentValue)[unitKey] * unit.seconds;
            const newValue = currentValue - unitLastValue + numberValue * unit.seconds; 
            setValue(newValue);
        }
    }

    

    return (
        <Label { ...labelPs}>
            <input
                // { ...inputPs}
                name={name}
                onChange={() => {}}
                value={currentValue}
                className={`hidden`}
                // className={twMerge(`hidden`, inputPs?.className)}
            />
            <div 
                { ...durationContainerProps}
                className={twMerge(`p-2 w-full rounded-md border flex items-center duration-100 bg-soft-bg ${isInputFocused ? "ring-1 ring-primary border-primary" : "border-border"}`, durationContainerProps?.className)}
            >
                {Object.entries(units).map(([key, unit], UI) =>
                    <Input
                        key={`unit${UI}`}
                        label={unit.label}
                        prefix={`:`}
                        suffix={`:`}
                        onFocus={() => set("isInputFocused", true)}
                        onBlur={() => set("isInputFocused", false)}
                        { ...inputsPs}
                        value={key === "days" ? secsToDuration(currentValue)[key] : formatUnit(secsToDuration(currentValue)[key])}
                        onValueChange={value => handleInputOnChange(key, value)}
                        className={twMerge(`text-2xl text-center`, inputsPs?.className)}
                        inputContainerProps={{
                            className: `p-0 border-0 ring-0`
                        }}
                        containerProps={{ className: "min-w-0" }}
                        labelContainerProps={{ className: "self-center" }}
                        labelProps={{ className: "text-soft-text italic font-normal text-sm" }}
                        childrenContainerProps={{ className: `justify-between items-center ${key === "days" && "border-r border-border"}` }}
                        prefixProps={{ className: "opacity-0" }}
                        suffixProps={{ className: `${(key === "seconds" || key === "days") && "opacity-0"}` }}
                    />
                )}
            </div>
        </Label>
    );
};

Duration.propTypes = durationPropTypes;