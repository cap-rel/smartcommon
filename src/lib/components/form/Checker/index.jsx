import { FaStar } from "react-icons/fa6";
import { useId, useRef } from "react";
import { isEmpty, isObject, isNil } from "lodash";

import { useField, useVariantMerger } from "lib/hooks";
import { Switch, Checkbox, Radio, Icon, Label } from "lib/components";
import { applyFunctionIfFunction, isEmptyValue } from "lib/utils";

import { DEFAULT_LABELS, propTypes } from "./props";

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];
const TOGGLE_KEYS = [" ", "Enter"];

// IDEA Add icon to switch like (like / dislike or check / cross, etc)

// data-* and aria-* written on an option object reach its element
const FORWARDED_ATTRIBUTE = /^(data|aria)-/;

export const Checker = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Checker", props);

    const {
        name,
        label,
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

        labels: userLabels = {},
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // The visible label names the group through aria-labelledby: a
    // <label htmlFor> cannot point at a div.
    const generatedId = useId();
    const labelId = variantProps.labelProps?.id ?? `${generatedId}-label`;

    const optionRefs = useRef([]);

    const errors = (currentValue) => ({
        required: {
            condition: required && isEmptyValue(currentValue),
            message: labels.requiredError,
        },
        min: {
            condition: !isNil(min) && multiple && (currentValue?.length ?? 0) < min,
            message: labels.minError(min),
        },
        max: {
            condition: !isNil(max) && multiple && (currentValue?.length ?? 0) > max,
            message: labels.maxError(max),
        },
        exact: {
            condition: !isNil(exact) && multiple && (currentValue?.length ?? 0) !== exact,
            message: labels.exactError(exact),
        },
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors, formSubmitted: variantProps.formSubmitted, onError: variantProps.onError }); // multiple ? [] : ""

    const isEditable = !disabled && !readOnly && !isFormSubmitting;

    const optionList = (options ?? []).map(option => ({
        value: isObject(option) ? option.value : option,
        label: isObject(option) ? option.label : option,
        disabled: isObject(option) && !!option.disabled,
        attributes: isObject(option)
            ? Object.fromEntries(Object.entries(option).filter(([key]) => FORWARDED_ATTRIBUTE.test(key)))
            : {},
    }));

    const isChecked = (optionValue) => multiple ? (currentValue ?? []).includes(optionValue) : currentValue === optionValue;

    // Single choice: roving tabindex, only the checked option (or the first
    // one) is in the tab order. Multiple choice: every box is tabbable.
    const checkedIndex = multiple ? -1 : optionList.findIndex(option => option.value === currentValue);
    const tabbableIndex = checkedIndex === -1 ? optionList.findIndex(option => !option.disabled) : checkedIndex;

    // In single choice, clicking the checked option clears the field unless
    // it is required: a required field cannot be emptied once filled.
    const handleOnClick = (option) => {
        if (!isEditable || option.disabled) {
            return;
        }
        const optionValue = option.value;
        if (multiple) {
            const safeCurrentValue = currentValue ?? [];
            setValue(safeCurrentValue.includes(optionValue) ? safeCurrentValue.filter(checkedOption => checkedOption !== optionValue) : [...safeCurrentValue, optionValue]);
            return;
        }
        if (currentValue === optionValue) {
            if (!required) {
                setValue("");
            }
            return;
        }
        setValue(optionValue);
    };

    const handleOnKeyDown = (e, optionIndex) => {
        if (TOGGLE_KEYS.includes(e.key)) {
            e.preventDefault();
            handleOnClick(optionList[optionIndex]);
            return;
        }
        if (multiple) {
            return;
        }

        const step = NEXT_KEYS.includes(e.key) ? 1 : PREVIOUS_KEYS.includes(e.key) ? -1 : 0;
        if (step === 0) {
            return;
        }

        e.preventDefault();
        // Disabled options are skipped; with none left, the focus stays put
        let nextIndex = optionIndex;
        for (let tries = 0; tries < optionList.length; tries++) {
            nextIndex = (nextIndex + step + optionList.length) % optionList.length;
            if (!optionList[nextIndex].disabled) {
                break;
            }
        }
        if (nextIndex === optionIndex || optionList[nextIndex].disabled) {
            return;
        }
        optionRefs.current[nextIndex]?.focus();
        if (isEditable) {
            setValue(optionList[nextIndex].value);
        }
    };

    const labelMergeProps = (key, propsFunction, mergeOptions) => key === "label"
        ? mergeProps(key, props => ({ id: labelId, ...propsFunction(props) }), mergeOptions)
        : mergeProps(key, propsFunction, mergeOptions);

    return (
        <Label 
            { ...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
            mergeProps={labelMergeProps}
        >
            {!isEmpty(options) &&
                <div { ...mergeProps("optionsContainer", props => ({
                    role: multiple ? "group" : "radiogroup",
                    "aria-labelledby": isNil(label) ? undefined : labelId,
                    "aria-required": required && !multiple ? "true" : undefined,
                    "aria-disabled": disabled ? "true" : undefined,
                    ...props,
                    className: `flex flex-col divide-y divide-border border border-border w-full rounded-app-md`
                }), { forwardAttributes: true })}>
                    {optionList.map((option, OI) => {
                        const optionValue = option.value;
                        const optionLabel = option.label;
                        const checked = isChecked(optionValue);
                        const optionDisabled = disabled || option.disabled;
                        const isTabbable = !optionDisabled && (multiple || OI === tabbableIndex);

                        return (
                            <div key={`option${OI}`} { ...mergeProps("option", props => ({
                                role: multiple ? "checkbox" : "radio",
                                "aria-checked": checked ? "true" : "false",
                                "aria-disabled": optionDisabled ? "true" : undefined,
                                tabIndex: isTabbable ? 0 : -1,
                                ...props,
                                ...option.attributes,
                                ref: el => { optionRefs.current[OI] = el; },
                                onClick: (e) => {
                                    applyFunctionIfFunction(props.onClick, e);
                                    handleOnClick(option);
                                },
                                onKeyDown: (e) => {
                                    handleOnKeyDown(e, OI);
                                    applyFunctionIfFunction(props.onKeyDown, e);
                                },
                                className: `first:rounded-t-app-md last:rounded-b-app-md bg-soft-bg flex justify-between items-center gap-app-base p-app-base active:brightness-soft aria-disabled:active:brightness-100 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed duration-(--really-quick) outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary`
                            }))}>
                                <div { ...mergeProps("optionLabel", props => ({
                                    ...props,
                                    className: `text-strong-text truncate grow`
                                }))}>
                                    {optionLabel}
                                </div>
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
                                        disabled={optionDisabled}
                                    />
                                : type === "radio" ?
                                    <Radio
                                        mergeProps={mergeProps}
                                        checked={checked}
                                        disabled={optionDisabled}
                                    />
                                : type === "icon" ?
                                    <Icon
                                        mergeProps={mergeProps}
                                        icon={checkedIcon}
                                        checked={checked}
                                        disabled={optionDisabled}
                                    />
                                :   <Checkbox
                                        mergeProps={mergeProps}
                                        checked={checked}
                                        disabled={optionDisabled}
                                    />
                                }
                            </div>
                        );
                    })}
                </div>
            }
      
        </Label>
    );
};

Checker.propTypes = propTypes;