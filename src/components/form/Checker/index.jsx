import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../tools/Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, Icon } from "../tools";
import { twMerge } from "tailwind-merge";
import { isEmpty, isNil, isObject, mergeProps } from "../../../globals/functions";

// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Checker = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Checker", props);

    const { extractedLabelProps, filteredProps } = useLabel(variantProps);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        icon,
        multiple,
        type,
        options,

    } = filteredProps;

    const { currentValue, setValue } = useValue(defaultValue ?? (multiple ? [] : ""), value, onChange);


    const handleOnClick = (optionValue) => {
        let newValue;

        if (multiple) {
            newValue = currentValue.includes(optionValue) ? currentValue.filter(checkedOption => checkedOption !== optionValue) : [...currentValue, optionValue];
        } else {
            newValue = currentValue === optionValue ? "" : optionValue;
        }

        setValue(newValue);
    };

    return (
        <Label 
            { ...extractedLabelProps}
            mergeProps={mergeProps}
        >
            {!isEmpty(options) &&
                <div { ...mergeProps("optionsContainer", props => ({
                    ...props,
                    className: `flex flex-col gap-app-sm`
                }))}
                    { ...mergeProps(
                        {}, `col rounded-md border border-border divide-y divide-border`,
                        listProps, {}, variant, "listProps", {}
                    )}
                >
                    {options.map((option, OI) => {
                        const optionValue = isObject(option) ? option.value : option;
                        const optionLabel = isObject(option) ? option.label : option;
                        const checked = multiple ? currentValue.includes(optionValue) : currentValue === optionValue;

                        return (
                            <div key={`option${OI}`} { ...mergeProps("optionContainer", props => ({
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
                                <div { ...mergeProps("optionLabel", props => ({
                                    ...props,
                                    className: `text-strong-text truncate`
                                }))}>
                                    {optionLabel}
                                </div>
                                {type === "switch" ?
                                    <Switch
                                        mergeProps={mergeProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : type === "checkbox" ?
                                    <Checkbox
                                        mergeProps={mergeProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : type === "radio" ?
                                    <Radio
                                        mergeProps={mergeProps}
                                        onClick={() => handleOnClick(optionValue)}
                                        checked={checked}
                                    />
                                : type === "icon" ?
                                    <Icon
                                        mergeProps={mergeProps}
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

Checker.propTypes = propTypes;