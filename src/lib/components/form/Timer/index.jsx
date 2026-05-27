import { useEffect } from "react";
import { isNumber, isNil } from "lodash";

import { formatDuration, secsToDuration } from "lib/utils";
import { Input, Label } from "lib/components";
import { useField, useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

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

        showSeconds = true,
    } = variantProps;

    const errors = (currentValue) => ({
        required: {
            condition: required && currentValue === 0,
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
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

    // Guarantee a finite number for duration maths - currentValue may be undefined
    // (before field init) or a non-numeric string coming from a parent form.
    const safeCurrentValue = isNumber(currentValue) && !Number.isNaN(currentValue) ? currentValue : 0;

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
        if (!disabled && !readOnly && !isFormSubmitting) {
            const numberValue = isNumber(Number(unitValue)) ? Number(unitValue) : 0;
            const unit = units[unitKey];
            if (numberValue <= unit.max) {
                // When the Seconds column is hidden, dropping the sub-minute
                // residue on every Minutes (or coarser) edit matches the
                // user's mental model: they only see/control whole minutes,
                // so any phantom seconds inherited from a pre-existing value
                // are intentionally lost on the next edit.
                const baseValue = (!showSeconds && unitKey !== "seconds")
                    ? safeCurrentValue - secsToDuration(safeCurrentValue).seconds
                    : safeCurrentValue;
                const unitLastValue = secsToDuration(baseValue)[unitKey] * unit.seconds;
                const newValue = baseValue - unitLastValue + numberValue * unit.seconds;
                setValue(newValue);
            }
        }
    };

    const inputPropsDependingOnUnit = (key, unit, props) => ({
        ...props,
        type: "number",
        label: unit.label,
        prefix: `:`,
        suffix: `:`,
        value: key === "days" ? secsToDuration(safeCurrentValue)[key] : formatUnit(secsToDuration(safeCurrentValue)[key]),
        onChange: value => handleInputOnChange(key, value),
        inputProps: { ...props.inputProps, className: `text-app-xl text-center` }, 
        inputContainerProps: { ...props.inputContainerProps, className: `p-0 border-0 has-[input:focus]:ring-0` },
        containerProps: { ...props.containerProps, className: "gap-0 flex-1" },
        labelContainerProps: { ...props.labelContainerProps, className: "self-center" },
        labelProps: { ...props.labelProps, className: "text-soft-text italic font-app-base text-app-sm" },
        childrenContainerProps: { ...props.childrenContainerProps, className: `flex justify-between items-center ${key === "days" && "border-r border-border"}` },
        prefixProps: { ...props.prefixProps, className: "opacity-0" },
        suffixProps: {
            ...props.suffixProps,
            className: `${
                (key === "seconds" || key === "days" || (key === "minutes" && !showSeconds))
                    ? "opacity-0"
                    : ""
            }`,
        },
    });

    return (
        <Label 
            { ...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
            mergeProps={mergeProps}
        >
            <input
                name={name}
                onChange={() => {}}
                value={currentValue ?? ""}
                hidden
            />
            <div { ...mergeProps("durationContainer", props => ({
                ...props,
                className: `p-app-xs w-full rounded-app-md border flex items-center duration-(--instant) bg-soft-bg has-[input:focus]:ring-1 ring-primary has-[input:focus]:border-primary border-border`
            }))}>
                <Input { ...mergeProps("DaysInputs", props => inputPropsDependingOnUnit("days", units.days, props))} />
                <Input { ...mergeProps("HoursInput", props => inputPropsDependingOnUnit("hours", units.hours, props))} />
                <Input { ...mergeProps("MinutesInput", props => inputPropsDependingOnUnit("minutes", units.minutes, props))} />
                {showSeconds && (
                    <Input { ...mergeProps("SecondsInput", props => inputPropsDependingOnUnit("seconds", units.seconds, props))} />
                )}
            </div>
        </Label>
    );
};

Timer.propTypes = propTypes;