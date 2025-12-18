import { useEffect } from "react";

import { useField, useVariantMerger } from "lib/hooks";
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
    } = variantProps;

    const errors = (currentValue) => ( {
        required: { 
            condition: required && isEmpty(currentValue),
            message: "Ce champ est requis."
        },
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

    const handleColorOnChange = (e) => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            const newValue = e.target.value;
            setValue(newValue);
        }
    };

    return (
        <Label 
            { ...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
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