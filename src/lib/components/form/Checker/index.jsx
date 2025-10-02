import { useLabel, useStates, useValue, useVariantMerger } from "../../../hooks";
import { Label } from "../tools/Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, Icon } from "../tools";
import { twMerge } from "tailwind-merge";
import { isEmpty, isNil, isObject, mergeProps } from "../../../utils/functions";
import { useEffect } from "react";
import { FaStar } from "react-icons/fa6";

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

    const { currentValue, setValue } = useValue(defaultValue ?? (multiple ? [] : ""), value, onChange);

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
                    className: `flex flex-col gap-app-sm`
                }))}>
                    {options.map((option, OI) => {
                        const optionValue = isObject(option) ? option.value : option;
                        const optionLabel = isObject(option) ? option.label : option;
                        const checked = multiple ? currentValue.includes(optionValue) : currentValue === optionValue;

                        return (
                            <div key={`option${OI}`} { ...mergeProps("option", props => ({
                                ...props,
                                className: `flex items-center gap-app-xs`
                            }))}>
                                <input
                                    type={`checkbox`}
                                    onChange={() => {}}
                                    value={optionValue}
                                    checked={checked}
                                    name={name}
                                    hidden                                    
                                />
                                {type === "checkbox" ?
                                    <Checkbox
                                        mergeProps={mergeProps}
                                        onClick={() => handleOnClick(optionValue)}
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
                                :   <Switch
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