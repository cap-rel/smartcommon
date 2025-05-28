import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../tools/Label";
import { Switch, Checkbox, Radio, Icon } from "../tools";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

import { propTypes } from "./props";
import { mergeProps } from "../../../globals/functions";
import { useEffect } from "react";
// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Boolean", props);

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

    const { currentValue, setValue } = useValue(defaultValue ?? false, value, onChange);

    const handleOnClick = () => {
        if (!disabled && !readOnly) {
            setValue(!currentValue);
        }
    };

    const errors = {
        required: { 
            condition: required && !currentValue,
            message: "Ce champ doit être coché."
        }
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