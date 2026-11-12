import { Fragment, useId, useRef } from "react";
import { isNil, isObject } from "lodash";

import { applyFunctionIfNotNil, isEmptyValue } from "lib/utils";
import { useField, useVariantMerger } from "lib/hooks";
import { Label } from "lib/components";

import { DEFAULT_LABELS, propTypes } from "./props";

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];
const SELECT_KEYS = [" ", "Enter"];

export const RadioBar = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("RadioBar", props);

    const {
        name,
        label,
        value,
        defaultValue,
        onChange = () => {},


        required,
        disabled,
        readOnly,

        options = [],

        labels: userLabels = {},
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // The visible label names the radiogroup through aria-labelledby: a
    // <label htmlFor> cannot point at a div.
    const generatedId = useId();
    const labelId = variantProps.labelProps?.id ?? `${generatedId}-label`;

    const optionRefs = useRef([]);

    const errors = (currentValue) => ({
        required: {
            condition: required && isEmptyValue(currentValue),
            message: labels.requiredError,
        },
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors, formSubmitted: variantProps.formSubmitted, onError: variantProps.onError });

    const isEditable = !disabled && !readOnly && !isFormSubmitting;

    const optionList = (options ?? []).map(option => ({
        value: isObject(option) ? option.value : option,
        label: isObject(option) ? option.label : option,
    }));

    const checkedIndex = optionList.findIndex(option => option.value === currentValue);
    // Roving tabindex: only one option is in the tab order, the checked one,
    // or the first one when nothing is checked yet.
    const tabbableIndex = checkedIndex === -1 ? 0 : checkedIndex;

    // Clicking the checked option clears the field, unless it is required:
    // a required field cannot be emptied once filled.
    const handleOnClick = (optionValue) => {
        if (!isEditable) {
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
        if (SELECT_KEYS.includes(e.key)) {
            e.preventDefault();
            handleOnClick(optionList[optionIndex].value);
            return;
        }

        const step = NEXT_KEYS.includes(e.key) ? 1 : PREVIOUS_KEYS.includes(e.key) ? -1 : 0;
        if (step === 0 || optionList.length === 0) {
            return;
        }

        e.preventDefault();
        const nextIndex = (optionIndex + step + optionList.length) % optionList.length;
        optionRefs.current[nextIndex]?.focus();
        if (isEditable) {
            setValue(optionList[nextIndex].value);
        }
    };

    const labelMergeProps = (key, propsFunction, options) => key === "label"
        ? mergeProps(key, props => ({ id: labelId, ...propsFunction(props) }), options)
        : mergeProps(key, propsFunction, options);

    return (
        <Label
            { ...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
            mergeProps={labelMergeProps}
        >
            <div { ...mergeProps("optionsContainer", props => ({
                role: "radiogroup",
                "aria-labelledby": isNil(label) ? undefined : labelId,
                "aria-required": required ? "true" : undefined,
                "aria-disabled": disabled ? "true" : undefined,
                "aria-readonly": readOnly ? "true" : undefined,
                ...props,
                className: `bg-strong-bg flex flex-wrap items-center p-app-xxs gap-app-xxs inset-shadow-sm rounded-app-md ${disabled ? "brightness-soft" : ""}`
            }), { forwardAttributes: true })}>
                {optionList.map((option, OI) => {
                    const isChecked = OI === checkedIndex;

                    return (
                        <Fragment key={option.value}>
                            <input
                                type={`checkbox`}
                                onChange={() => {}}
                                checked={isChecked}
                                name={name}
                                value={option.value}
                                hidden
                            />
                            <div { ...mergeProps("option", props => ({
                                role: "radio",
                                "aria-checked": isChecked ? "true" : "false",
                                "aria-disabled": disabled ? "true" : undefined,
                                tabIndex: !disabled && OI === tabbableIndex ? 0 : -1,
                                ...props,
                                ref: el => { optionRefs.current[OI] = el; },
                                onClick: e => {
                                    handleOnClick(option.value);
                                    applyFunctionIfNotNil(props.onClick, e);
                                },
                                onKeyDown: e => {
                                    handleOnKeyDown(e, OI);
                                    applyFunctionIfNotNil(props.onKeyDown, e);
                                },
                                style: { transition: "background-color 300ms, color 300ms, filter 100ms" },
                                className: `rounded-app-md px-app-xs py-app-xxs outline-none focus-visible:ring-2 focus-visible:ring-primary ${isChecked ? "bg-soft-bg text-strong-text shadow-md" : `bg-strong-bg text-soft-text ${!disabled ? "active:brightness-soft" : ""}`}`
                            }))}>
                                {option.label}
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </Label>
    );
};

RadioBar.propTypes = propTypes;
