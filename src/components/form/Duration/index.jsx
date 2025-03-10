import { useEffect } from "react";
import { isNil, isNumber, secsToDuration } from "../../../globals/functions";
import { Input, Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useStates } from "../../../hooks";

export const Duration = ({
    label,
    labelRow = false,
    help,
    onValueChange = () => {},

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputProps,
    durationContainerProps,
    unitContainerProps,
    unitLabelProps,
    unitInputContainerProps,
    unitLeftProps,
    unitInputProps,
    unitRightProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };
    const { required, readOnly, disabled, id, value, defaultValue } = inputPs;
  
    const inputPsForLabel = { disabled, required, readOnly, id };
  
    const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

    const units = {
        days: { label: "Jours", seconds: 60 * 60 * 24, max: 9999 },
        hours: { label: "Heures", seconds: 60 * 60, max: 23 },
        minutes: { label: "Minutes", seconds: 60, max: 59 },
        seconds: { label: "Secondes", seconds: 1,  max: 59 }
    };

    // const defaultLocalValue = value ?? defaultValue ?? 0;

    const formatUnit = (number) => {
        return `0${number}`.slice(-2);
    }

    const { states, set } = useStates({
        isInputFocused: false,
        localValue: defaultValue ?? 0,
        // inputs: {
        //     days: secsToDuration(defaultLocalValue)["days"],
        //     hours: formatUnit(secsToDuration(defaultLocalValue)["hours"]),
        //     minutes: formatUnit(secsToDuration(defaultLocalValue)["minutes"]),
        //     seconds: formatUnit(secsToDuration(defaultLocalValue)["seconds"])
        // }
    });

    const { localValue, isInputFocused } = states;

    const realValue = value ?? localValue;

    // const localValueInSeconds = () => {
    //     let seconds = 0;
    //     Object.entries({ ...localValue}).forEach(([key, unitValue], UVI) => {
    //         seconds += (Number(unitValue) * units[key].seconds);
    //     }); 
    //     return seconds;
    // };

    const handleInputOnChange = (unitKey, unitValue) => {
        const numberValue = isNumber(Number(unitValue)) ? Number(unitValue) : 0; 
        const unit = units[unitKey];
        if (numberValue <= unit.max) {
            const unitLastValue = secsToDuration(realValue)[unitKey] * unit.seconds;
            const newValue = realValue - unitLastValue + numberValue * unit.seconds; 

            if (isNil(value)) {
                set("localValue", newValue);
            } else {
                onValueChange(newValue);
            }
        }
    } 

    return (
        <Label { ...allLabelPs}>
            <input
                { ...inputPs}
                onChange={() => {}}
                value={realValue}
                className={twMerge(`hidden`, inputPs?.className)}
            />
            <div 
                { ...durationContainerProps}
                className={twMerge(`p-2 w-full rounded-md border row-evenly-center duration-100 border-soft-border bg-strong ${isInputFocused && "ring-2 ring-primary"}`, durationContainerProps?.className)}
            >
                {Object.entries(units).map(([key, unit], UI) =>
                    <div
                        key={`unit${UI}`}
                        { ...unitContainerProps}
                        className={twMerge(`gap-2 col-h-center grow`, unitContainerProps?.className)}
                    >   
                        <label
                            { ...unitLabelProps}
                            className={twMerge(`text-sm italic text-soft-text`, unitLabelProps?.className)}
                        >
                            {unit.label}
                        </label>
                        <div 
                            { ...unitInputContainerProps}
                            className={twMerge(`row-between-center ${key === "days" && "border-r border-soft-border"}`, unitInputContainerProps?.className)}
                        >
                            <div
                                { ...unitLeftProps}
                                className={twMerge(`opacity-0`, unitLeftProps?.className)}
                            >
                                :
                            </div>
                            <Input
                                onFocus={() => set("isInputFocused", true)}
                                onBlur={() => set("isInputFocused", false)}
                                { ...unitInputProps}
                                value={key === "days" ? secsToDuration(realValue)[key] : formatUnit(secsToDuration(realValue)[key])}
                                onValueChange={value => handleInputOnChange(key, value)}
                                className={twMerge(`p-0 text-2xl text-center border-none focus:ring-0`, unitInputProps?.className)}
                            />
                            <div
                                { ...unitRightProps}
                                className={twMerge(`${(key === "seconds" || key === "days") && "opacity-0"}`, unitRightProps?.className)}
                            >
                                :
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Label>
    );
};

Duration.propTypes = propTypes;