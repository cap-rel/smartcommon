import { useStates } from "../../../hooks";
import { Label } from "../Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";
import { twMerge } from "tailwind-merge";
import { isEmpty, isNil, isObject, mergeProps } from "../../../globals/functions";

// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Check = ({
    label,
    labelRow = false,
    help,
    type = "checkbox", // switch, radio, icon
    icon,
    options = [],
    onValueChange = () => {},
    variant,

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
                    { ...mergeProps(
                        {}, `col rounded-md border border-border divide-y divide-border`,
                        listProps, {}, variant, "listProps", {}
                    )}
                >
                    {options.map((option, OI) => {
                        const optionValue = isObject(option) ? option.value : option;
                        const optionLabel = isObject(option) ? option.label : option;
                        const checked = multiple ? realValue.includes(optionValue) : realValue === optionValue;

                        return (
                            <div 
                                { ...mergeProps(
                                    {}, `row-between-center gap-2 p-2 bg-soft-bg first:rounded-t-md last:rounded-b-md`,
                                    listItemProps, {}, variant, "listItemProps", {}
                                )}
                            >
                                <input
                                    { ...mergeProps(
                                        {}, `hidden`,
                                        inputPs, {}, variant, "inputProps", {}
                                    )}
                                    type={`checkbox`}
                                    onChange={() => {}}
                                    value={optionValue}
                                    checked={checked}
                                />
                                <div
                                    { ...mergeProps(
                                        {}, `text-strong-text truncate`,
                                        optionLabelProps, {}, variant, "optionLabelProps", {}
                                    )}
                                >
                                    {optionLabel}
                                </div>
                                {type === "switch" ?
                                    <Switch
                                        { ...switchProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : type === "checkbox" ?
                                    <Checkbox
                                        { ...checkboxProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : type === "radio" ?
                                    <Radio
                                        { ...radioProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : type === "icon" ?
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