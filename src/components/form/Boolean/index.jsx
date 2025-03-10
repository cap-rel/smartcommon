import { useEffect } from "react";
import { useStates } from "../../../hooks";
import { Label } from "../Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = ({
    label,
    labelRow = false,
    help,
    variant = "switch",
    icon,
    onValueChange = () => {},

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputProps,
    switchProps,
    checkboxProps,
    radioProps,
    iconProps,
    ...props
}) => {
    const booleanPs = { ...props, ...inputProps };
    const { required, readOnly, disabled, id, value, defaultValue } = booleanPs;

    const blocked = disabled || readOnly;
  
    const booleanPsForLabel = { disabled, required, readOnly, id };

    if (labelRow) {
        containerProps = { ...containerProps, className: twMerge(`row-between-center bg-strong border border-soft-border p-2 rounded-md`, containerProps?.className) };
        labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    }

    const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...booleanPsForLabel };

    const { states, set } = useStates({
        localValue: defaultValue ?? false
    });

    const { localValue } = states;

    const realValue = value ?? localValue;

    const handleOnClick = () => {
        if (isNil(value)) {
            set("localValue", !realValue, !blocked);
        } else {
            if (!blocked) {
                onValueChange(!realValue)
            }
        }
    };

    return (
        <Label { ...allLabelPs}>
            <input
                { ...booleanPs}
                type={`checkbox`}
                onChange={() => {}}
                checked={realValue}
                className={twMerge(`hidden`, booleanPs?.className)}
            />
            {variant === "switch" ?
                <Switch
                    { ...switchProps}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : variant === "checkbox" ?
                <Checkbox
                    { ...checkboxProps}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : variant === "radio" ?
                <Radio
                    { ...radioProps}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : variant === "icon" ?
                <CheckedIcon
                    { ...iconProps}
                    icon={icon}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : ""}
      
        </Label>
    );
};

Boolean.propTypes = propTypes;