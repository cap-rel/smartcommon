import { useEffect } from "react";

import { useLocalValue, useVariantMerger } from "lib/hooks";
import { Label } from "lib/components";
import { applyFunctionIfNotNil, isEmpty } from "lib/utils";

import { propTypes } from "./props";

// TODO tailwind color

export const ColorPicker = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("ColorPicker", props);

    const {
        id,
        name,
        defaultValue,
        value,
        onChange,

        required,
        disabled,
        readOnly,

        onError = () => {},
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
            <input { ...mergeProps("input", props => ({
                ...props,
                ...mergeQuickProps(["name", "disabled", "readOnly", "onFocus", "onBlur"]),
                type: "color",
                onChange: e => {
                    handleColorOnChange(e);
                    applyFunctionIfNotNil(props.onChange, e);
                },
                value: currentValue,
                className: `size-6 border-border duration-(--really-quick) ${disabled ? "brightness-soft" : "active:brightness-soft"}`,
            }))} />
        </Label>
    );
};

ColorPicker.propTypes = propTypes;