import { useEffect } from "react";

import { useField, useVariantMerger } from "lib/hooks";
import { Switch, Checkbox, Radio, Icon, Label } from "lib/components";

import { propTypes } from "./props";
// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Boolean", props);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        required,
        disabled,
        readOnly,

        checkedIcon,
        type,

        onError = () => {},
    } = variantProps;

    // if (labelRow) {
    //     containerProps = { ...containerProps, className: twMerge(`row-between-center bg-soft-bg border border-border p-2 rounded-md`, containerProps?.className) };
    //     labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    // }

    const errors = (currentValue) => ({
        required: { 
            condition: required && !currentValue,
            message: "Ce champ doit être coché."
        }
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting } = useField({ name, defaultValue, value, onChange, errors }); // false

    const handleOnClick = () => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            setValue(!currentValue);
        }
    };

    return (
        <Label 
            { ...variantProps}
            showErrors={isFormSubmitted}
            currentValue={currentValue}
            errors={errors}
            mergeProps={mergeProps}
        >
            <input
                type={`checkbox`}
                onChange={() => {}}
                checked={currentValue}
                name={name}
                hidden
            />
            {type === "checkbox" ?
                <Checkbox
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                    disabled={disabled}
                />
            : type === "radio" ?
                <Radio
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                    disabled={disabled}
                />
            : type === "icon" ?
                <Icon
                    icon={checkedIcon}
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                    disabled={disabled}
                />
            :   <Switch
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                    disabled={disabled}
                />
            }
      
        </Label>
    );
};

Boolean.propTypes = propTypes;