import { useEffect } from "react";
import { useStates } from "../../../hooks";
import { Label } from "../Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { isEmpty, isNil, isObject } from "../../../globals/functions";

// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Check = ({
    label,
    labelRow = false,
    help,
    variant = "checkbox", // switch, radio, icon
    icon,
    options = [],
    onValueChange = () => {},

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    listProps,
    listItemProps,
    inputProps,
    optionLabelProps,
    switchProps,
    checkboxProps,
    radioProps,
    iconProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };
    const { required, readOnly, disabled, id, value, defaultValue, multiple } = inputPs;

    const blocked = disabled || readOnly;
  
    const inputPsForLabel = { disabled, required, readOnly, id };

    if (labelRow) {
        containerProps = { ...containerProps, className: twMerge(`row-between-center bg-strong border border-soft-border p-2 rounded-md`, containerProps?.className) };
        labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    }

    const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

    const { states, set } = useStates({
        localValue: defaultValue ?? (multiple ? [] : "") 
    });

    const { localValue } = states;

    const realValue = value ?? localValue;

    const handleOnClick = (optionValue) => {
        let newValue;

        if (multiple) {
            newValue = realValue.includes(optionValue) ? realValue.filter(checkedOption => checkedOption !== optionValue) : [...realValue, optionValue];
        } else {
            newValue = realValue === optionValue ? "" : optionValue;
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue);
        }
    };

    return (
        <Label { ...allLabelPs}>
            {!isEmpty(options) &&
                <div
                    { ...listProps}
                    className={twMerge(`col rounded-md border border-soft-border divide-y divide-soft-border`, listProps?.className)}
                >
                    {options.map((option, OI) => {
                        const optionValue = isObject(option) ? option.value : option;
                        const optionLabel = isObject(option) ? option.label : option;
                        const checked = multiple ? realValue.includes(optionValue) : realValue === optionValue;

                        return (
                            <div 
                                { ...listItemProps}
                                className={twMerge(`row-between-center gap-2 p-2 bg-strong first:rounded-t-md last:rounded-b-md`, listItemProps?.className)}
                            >
                                <input
                                    { ...inputPs}
                                    type={`checkbox`}
                                    onChange={() => {}}
                                    value={optionValue}
                                    checked={checked}
                                    className={twMerge(`hidden`, inputPs?.className)}
                                />
                                <div
                                    { ...optionLabelProps}
                                    className={twMerge(`text-strong-text truncate`, optionLabelProps?.className)}
                                >
                                    {optionLabel}
                                </div>
                                {variant === "switch" ?
                                    <Switch
                                        { ...switchProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : variant === "checkbox" ?
                                    <Checkbox
                                        { ...checkboxProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : variant === "radio" ?
                                    <Radio
                                        { ...radioProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : variant === "icon" ?
                                    <CheckedIcon
                                        { ...iconProps}
                                        icon={icon}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : ""}
                            </div>
                        );
                    })}
                </div>
            }
      
        </Label>
    );
};

Check.propTypes = propTypes;