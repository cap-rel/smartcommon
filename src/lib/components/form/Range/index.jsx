import { useEffect } from "react";

import { Label } from "lib/components";
import { useLocalValue, useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil, isEmpty, isNil } from "lib/utils";

import { propTypes } from "./props";

export const Range = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("Range", props);
    
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

        rangeMin = 0,
        rangeMax = 100,

        onError = () => {}
    } = variantProps;

    const { currentValue, setValue } = useLocalValue(defaultValue ?? null, value, onChange);

    const handleColorOnChange = (e) => {
        if (!disabled && !readOnly) {
            const newValue = e.target.value;
            setValue(newValue);
        }
    };

    const errors = {
        required: {
            condition: required && isEmpty(currentValue),
            message: "Ce champ est requis."
        },
        min: {
            condition: !isNil(min) && currentValue < min,
            message: `La valeur doit être de ${min} au minimum.`
        },
        max: {
            condition: !isNil(max) && currentValue > max,
            message: `La valeur doit être de ${max} au minimum.`
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
            <div { ...mergeProps("rangeContainer", props => ({
                ...props,
                className: `gap-2 row-v-center`
            }))}>
                <input { ...mergeProps("input", props => ({
                    min: rangeMin,
                    max: rangeMax,
                    ...props,
                    ...mergeQuickProps(["name", "disabled", "readOnly", "onFocus", "onBlur"]),
                    type: "range",
                    onChange: e => {
                        handleColorOnChange(e);
                        applyFunctionIfNotNil(props.onChange, e);
                    },
                    value: currentValue,
                    className: `grow w-full bg-transparent appearance-none accent-primary cursor-ew-resize ${disabled && "brightness-soft"}`,
                }))} />
                <div { ...mergeProps("value", props => props)}>
                    {currentValue}
                </div>
            </div>
        </Label>
    );  
};

Range.propTypes = propTypes;