import { applyFunctionIfNotNil, isObject } from "../../../globals";
import { useLabel, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../tools/Label";
import { propTypes } from "./props";

export const RadioBar = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("RadioBar", props);

    const { extractedLabelProps, filteredProps } = useLabel(variantProps);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        options,
        multiple
    } = filteredProps;

    const { currentValue, setValue } = useValue(defaultValue ?? false, value, onChange);

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
            <div { ...mergeProps("optionsContainer", props => ({
                ...props,
                className: `bg-strong-bg flex flex-wrap items-center p-app-xxs gap-app-xxs inset-shadow-sm rounded-app-md`
            }))}>
                {options.map((option, OI) => {
                    const optionValue = isObject(option) ? option.value : option;
                    const optionLabel = isObject(option) ? option.label : option;
                    const isChecked = multiple ? currentValue.includes(optionValue) : currentValue === optionValue;

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
                                className: `rounded-app-md px-app-xs py-app-xxs ${isChecked ? "bg-soft-bg text-strong-text shadow-md" : "bg-strong-bg text-soft-text active:brightness-soft"}`
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