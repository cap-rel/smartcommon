import { FaStar } from "react-icons/fa6";
import { useEffect } from "react";

import { useLocalValue, useVariantMerger } from "lib/hooks";
import { Switch, Checkbox, Radio, Icon, Label } from "lib/components";
import { applyFunctionIfFunction, isEmpty, isNil, isObject } from "lib/utils";

import { propTypes } from "./props";

// IDEA Add icon to switch like (like / dislike or check / cross, etc)
// TODO Add attributes to options like disabled, color, maybe props

export const Checker = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Checker", props);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        required,
        disabled,
        readOnly,
        min,
        exact,
        max,

        multiple,
        options = [],

        checkedIcon = <FaStar />,
        type,

        onError = () => {},
    } = variantProps;

    const { currentValue, setValue } = useLocalValue(defaultValue ?? (multiple ? [] : ""), value, onChange);

    const handleOnClick = (optionValue) => {
        if (!disabled && !readOnly) {
            let newValue;

            if (multiple) {
                newValue = currentValue.includes(optionValue) ? currentValue.filter(checkedOption => checkedOption !== optionValue) : [...currentValue, optionValue];
            } else {
                newValue = currentValue === optionValue ? "" : optionValue;
            }

            setValue(newValue);
        }
    };

    const errors = {
        required: { 
            condition: required && isEmpty(currentValue),
            message: "Une case doit être cochée."
        },
        min: { 
            condition: !isNil(min) && multiple && currentValue.length < min,
            message: `${min} cases doivent être cochées au minimum.`
        },
        max: { 
            condition: !isNil(max) && multiple && currentValue.length > max,
            message: `${max} cases doivent être cochées au maximum.`
        },
        exact: { 
            condition: !isNil(exact) && multiple && currentValue.length !== exact,
            message: `Exactement ${exact} cases doivent être cochées.`
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
            {!isEmpty(options) &&
                <div { ...mergeProps("optionsContainer", props => ({
                    ...props,
                    className: `flex flex-col divide-y divide-border border border-border`
                }))}>
                    {options.map((option, OI) => {
                        const optionValue = isObject(option) ? option.value : option;
                        const optionLabel = isObject(option) ? option.label : option;
                        const checked = multiple ? currentValue.includes(optionValue) : currentValue === optionValue;

                        return (
                            <div key={`option${OI}`} { ...mergeProps("option", props => ({
                                ...props,
                                onClick: () => {
                                    applyFunctionIfFunction(props.onClick, e);
                                    handleOnClick(optionValue);
                                },
                                className: `first:rounded-t-app-md last:rounded-b-app-md bg-soft-bg flex justify-between items-center gap-app-base p-app-base active:brightness-soft duration-(--really-quick)`
                            }))}>
                                <input
                                    type={`checkbox`}
                                    onChange={() => {}}
                                    value={optionValue}
                                    checked={checked}
                                    name={name}
                                    hidden                                    
                                />
                                {type === "switch" ?
                                    <Switch
                                        mergeProps={mergeProps}
                                        checked={checked}
                                        disabled={disabled}
                                    />
                                : type === "radio" ?
                                    <Radio
                                        mergeProps={mergeProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                        disabled={disabled}
                                    />
                                : type === "icon" ?
                                    <Icon
                                        mergeProps={mergeProps}
                                        icon={checkedIcon}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                        disabled={disabled}
                                    />
                                :   <Checkbox
                                        mergeProps={mergeProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                        disabled={disabled}
                                    />
                                }
                                <div { ...mergeProps("optionLabel", props => ({
                                    ...props,
                                    className: `text-strong-text truncate`
                                }))}>
                                    {optionLabel}
                                </div>
                            </div>
                        );
                    })}
                </div>
            }
      
        </Label>
    );
};

Checker.propTypes = propTypes;