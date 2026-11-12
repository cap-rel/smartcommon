import { useId } from "react";
import { isNil } from "lodash";

import { useField, useVariantMerger } from "lib/hooks";
import { Switch, Checkbox, Radio, Icon, Label } from "lib/components";
import { applyFunctionIfNotNil } from "lib/utils";

import { DEFAULT_LABELS, propTypes } from "./props";
// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Boolean", props);

    const {
        id,
        name,
        label,
        value,
        defaultValue,
        onChange = () => {},


        required,
        disabled,
        readOnly,

        checkedIcon,
        type,

        labels: userLabels = {},
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // if (labelRow) {
    //     containerProps = { ...containerProps, className: twMerge(`row-between-center bg-soft-bg border border-border p-2 rounded-md`, containerProps?.className) };
    //     labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    // }

    const errors = (currentValue) => ({
        required: {
            condition: required && !currentValue,
            message: labels.requiredError,
        }
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors, formSubmitted: variantProps.formSubmitted, onError: variantProps.onError }); // false

    const handleOnClick = () => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            setValue(!currentValue);
        }
    };

    const checked = !!currentValue;

    // The visible label names the control through aria-labelledby: the
    // control is a div, which a <label htmlFor> cannot target.
    const generatedId = useId();
    const labelId = variantProps.labelProps?.id ?? `${generatedId}-label`;

    // Element key of the drawn control for each look (see form/tools).
    const controlKey = { checkbox: "checkbox", radio: "radio", icon: "checkedIcon" }[type] ?? "switch";

    // The drawn control is the focusable element: role, state, keyboard,
    // focus ring, and the data-* / aria-* written on <Boolean>.
    const controlMergeProps = (key, propsFunction, mergeOptions = {}) => {
        if (key === "label") {
            return mergeProps(key, props => ({ id: labelId, ...propsFunction(props) }), mergeOptions);
        }
        if (key !== controlKey) {
            return mergeProps(key, propsFunction, mergeOptions);
        }
        return mergeProps(key, props => {
            const built = propsFunction(props);
            return {
                role: controlKey === "switch" ? "switch" : "checkbox",
                "aria-checked": checked ? "true" : "false",
                "aria-labelledby": isNil(label) ? undefined : labelId,
                "aria-required": required ? "true" : undefined,
                "aria-disabled": disabled ? "true" : undefined,
                "aria-readonly": readOnly ? "true" : undefined,
                tabIndex: disabled ? -1 : 0,
                id,
                ...built,
                onKeyDown: e => {
                    if (e.key === " ") {
                        e.preventDefault();
                        handleOnClick();
                    }
                    applyFunctionIfNotNil(props.onKeyDown, e);
                },
                className: `${built.className ?? ""} outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-soft-bg`,
            };
        }, { ...mergeOptions, forwardAttributes: true });
    };

    return (
        <Label 
            { ...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
            mergeProps={controlMergeProps}
        >
            <input
                type={`checkbox`}
                onChange={() => {}}
                checked={checked}
                name={name}
                hidden
            />
            {type === "checkbox" ?
                <Checkbox
                    mergeProps={controlMergeProps}
                    onClick={handleOnClick}
                    checked={checked}
                    disabled={disabled}
                />
            : type === "radio" ?
                <Radio
                    mergeProps={controlMergeProps}
                    onClick={handleOnClick}
                    checked={checked}
                    disabled={disabled}
                />
            : type === "icon" ?
                <Icon
                    icon={checkedIcon}
                    mergeProps={controlMergeProps}
                    onClick={handleOnClick}
                    checked={checked}
                    disabled={disabled}
                />
            :   <Switch
                    mergeProps={controlMergeProps}
                    onClick={handleOnClick}
                    checked={checked}
                    disabled={disabled}
                />
            }
      
        </Label>
    );
};

Boolean.propTypes = propTypes;