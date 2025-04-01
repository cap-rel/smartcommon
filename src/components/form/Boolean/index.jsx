import { useStates } from "../../../hooks";
import { Label } from "../Label";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

import { booleanPropTypes } from "./props";
import { booleanVariants } from "./variants";
import { mergeProps } from "../../../globals/functions";
// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = ({
    label,
    help,
    type = "switch",
    icon,
    onValueChange = () => {},
    variant = "smart",

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
    const inputPs = { ...props, ...inputProps };
    const { required, readOnly, disabled, id, value, defaultValue } = inputPs;

    const blocked = disabled || readOnly;
  
    const inputPsForLabel = { disabled, required, readOnly, id };

    // if (labelRow) {
    //     containerProps = { ...containerProps, className: twMerge(`row-between-center bg-soft-bg border border-border p-2 rounded-md`, containerProps?.className) };
    //     labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    // }

    const allLabelPs = { label, help, variants: booleanVariants, variant, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

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

    const variantParams = { isChecked: realValue };

    return (
        <Label { ...allLabelPs}>
            <input
                { ...mergeProps(
                    {}, `hidden`,
                    inputPs, booleanVariants, variant, "inputProps", variantParams
                )}
                type={`checkbox`}
                onChange={() => {}}
                checked={realValue}
                className={twMerge(`hidden`, inputPs?.className)}
            />
            {type === "switch" ?
                <Switch
                    { ...switchProps}
                    variants={booleanVariants}
                    variant={variant}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : type === "checkbox" ?
                <Checkbox
                    { ...checkboxProps}
                    variants={booleanVariants}
                    variant={variant}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : type === "radio" ?
                <Radio
                    { ...radioProps}
                    variants={booleanVariants}
                    variant={variant}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : type === "icon" ?
                <CheckedIcon
                    { ...iconProps}
                    icon={icon}
                    variants={booleanVariants}
                    variant={variant}
                    onClick={handleOnClick}
                    checked={realValue}
                />
            : ""}
      
        </Label>
    );
};

Boolean.propTypes = booleanPropTypes;