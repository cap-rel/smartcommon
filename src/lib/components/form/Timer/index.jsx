import { applyFunctionIfNotNil, formatDuration, isNil, isNumber, secsToDuration } from "../../../utils/functions";
import { Input, Label } from "../../form";
import { twMerge } from "tailwind-merge";
import { useStates, useLocalValue, useVariantMerger } from "../../../hooks";

import { propTypes } from "./props";
import { useEffect } from "react";

export const Timer = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Timer", props);

    const {
        id,
        name,
        defaultValue,
        value,
        onChange = () => {},

        required,
        disabled,
        readOnly,

        min,
        max,

        onError = () => {}
    } = variantProps;

    const { currentValue, setValue } = useLocalValue(defaultValue ?? 0, value, onChange);

    const units = {
        days: { label: "Jours", seconds: 60 * 60 * 24, max: 9999 },
        hours: { label: "Heures", seconds: 60 * 60, max: 23 },
        minutes: { label: "Minutes", seconds: 60, max: 59 },
        seconds: { label: "Secondes", seconds: 1,  max: 59 }
    };

    const formatUnit = (number) => {
        return `0${number}`.slice(-2);
    };

    const handleInputOnChange = (unitKey, unitValue) => {
        if (!disabled && !readOnly) {
            const numberValue = isNumber(Number(unitValue)) ? Number(unitValue) : 0; 
            const unit = units[unitKey];
            if (numberValue <= unit.max) {
                const unitLastValue = secsToDuration(currentValue)[unitKey] * unit.seconds;
                const newValue = currentValue - unitLastValue + numberValue * unit.seconds; 
                setValue(newValue);
            }
        }
    };

    const inputPropsDependingOnUnit = (key, unit, props) => ({
        ...props,
        label: unit.label,
        prefix: `:`,
        suffix: `:`,
        value: key === "days" ? secsToDuration(currentValue)[key] : formatUnit(secsToDuration(currentValue)[key]),
        onChange: value => handleInputOnChange(key, value),
        inputProps: { ...props.inputProps, className: `text-app-xl text-center` }, 
        inputContainerProps: { ...props.inputContainerProps, className: `p-0 border-0 has-[input:focus]:ring-0` },
        containerProps: { ...props.containerProps, className: "gap-0 flex-1" },
        labelContainerProps: { ...props.labelContainerProps, className: "self-center" },
        labelProps: { ...props.labelProps, className: "text-soft-text italic font-app-base text-app-sm" },
        childrenContainerProps: { ...props.childrenContainerProps, className: `flex justify-between items-center ${key === "days" && "border-r border-border"}` },
        prefixProps: { ...props.prefixProps, className: "opacity-0" },
        suffixProps: { ...props.suffixProps, className: `${(key === "seconds" || key === "days") && "opacity-0"}` },
    });

    const errors = {
        required: {
            condition: required && currentValue == 0,
            message: "Ce champ est requis." 
        },
        min: {
            condition: !isNil(min) && currentValue < min,
            message: `La durée doit être de ${formatDuration(min)} au minimum.`
        },
        max: {
            condition: !isNil(max) && currentValue > max,
            message: `La valeur doit être de ${formatDuration(max)} au maximum.`
        },
    };

    useEffect(() => {
        Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition))
    }, [currentValue]);

    return (
        <Label 
            { ...variantProps}
            errors={errors}
            mergeProps={mergeProps}
        >
            <input
                name={name}
                onChange={() => {}}
                value={currentValue}
                hidden
            />
            <div { ...mergeProps("durationContainer", props => ({
                ...props,
                className: `p-app-xs w-full rounded-app-md border flex items-center duration-(--instant) bg-soft-bg has-[input:focus]:ring-1 ring-primary has-[input:focus]:border-primary border-border`
            }))}>
                <Input { ...mergeProps("DaysInputs", props => inputPropsDependingOnUnit("days", units.days, props))} />
                <Input { ...mergeProps("HoursInput", props => inputPropsDependingOnUnit("hours", units.hours, props))} />
                <Input { ...mergeProps("MinutesInput", props => inputPropsDependingOnUnit("minutes", units.minutes, props))} />
                <Input { ...mergeProps("SecondsInput", props => inputPropsDependingOnUnit("seconds", units.seconds, props))} />
            </div>
        </Label>
    );
};

Timer.propTypes = propTypes;