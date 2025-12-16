import { useEffect } from "react";

import { applyFunctionIfNotNil, isEmpty, isObject } from "lib/utils";
import { useField, useVariantMerger } from "lib/hooks";
import { Label } from "lib/components";

import { propTypes } from "./props";

export const RadioBar = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("RadioBar", props);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        required,
        disabled,
        readOnly,

        options = [],

        onError = () => {}
    } = variantProps;

    const errors = {
        required: { 
            condition: required && isEmpty(currentValue),
            message: "1 élément doit être sélectionné."
        },
    };

    const { currentValue, setValue } = useField(defaultValue ?? "", value, onChange, errors, onError, id);

    const handleOnClick = (optionValue) => {
        if (!disabled && !readOnly) {    
            let newValue = currentValue === optionValue ? "" : optionValue;
            setValue(newValue);
        }
    };

    return (
        <Label 
            { ...variantProps}
            errors={errors}
            mergeProps={mergeProps}
        >
            <div { ...mergeProps("optionsContainer", props => ({
                ...props,
                className: `bg-strong-bg flex flex-wrap items-center p-app-xxs gap-app-xxs inset-shadow-sm rounded-app-md ${disabled && "brightness-soft"}`
            }))}>
                {options.map((option, OI) => {
                    const optionValue = isObject(option) ? option.value : option;
                    const optionLabel = isObject(option) ? option.label : option;
                    const isChecked = currentValue === optionValue;

                    return (
                        <>
                            <input
                                type={`checkbox`}
                                onChange={() => {}}
                                checked={isChecked}
                                name={name}
                                value={optionValue}
                                hidden
                            />
                            <div { ...mergeProps("option", props => ({
                                ...props,
                                onClick: e => {
                                    handleOnClick(optionValue);
                                    applyFunctionIfNotNil(props.onClick, e);
                                },
                                style: { transition: "background-color 300ms, color 300ms, filter 100ms" },
                                className: `rounded-app-md px-app-xs py-app-xxs ${isChecked ? "bg-soft-bg text-strong-text shadow-md" : `bg-strong-bg text-soft-text ${!disabled && "active:brightness-soft"}`}`
                            }))}>
                                {optionLabel}
                            </div>
                        </>
                    );
                })}
            </div>
        </Label>
    );
};

RadioBar.propTypes = propTypes;