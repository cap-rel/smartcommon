import { twMerge } from "tailwind-merge";
import { Label } from "../../form";
import { propTypes } from "./props";
import { IoIosArrowDown } from "react-icons/io";
import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { applyFunctionIfNotNil, isEmpty, isNil, isObject } from "../../../globals/functions";
import { useEffect } from "react";

// TODO Add attributes to options like disabled, maybe props

export const Select = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Select", props);
  
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

    onError = () => {},
  } = variantProps;

  const { currentValue, setValue } = useValue(defaultValue ?? (multiple ? [] : ""), value, onChange);

  const handleSelectOnChange = e => {
    if (!disabled && !readOnly) {
      const newValue = multiple ? Array.from(e.target.selectedOptions, option => option.value) : e.target.value;
      setValue(newValue);
    }
  };

  const errors = {
    required: {
      condition: required && isEmpty(currentValue),
      message: "1 élément doit être sélectionné au minimum."
    },
    min: {
      condition: !isNil(min) && multiple && currentValue.length < min,
      message: `${min} éléments doivent être sélectionnés au minimum.`
    },
    max: {
      condition: !isNil(max) && multiple && currentValue.length > max,
      message: `${max} éléments doivent être sélectionnés au maximum.`
    },
    exact: {
      condition: !isNil(exact) && multiple && currentValue.length !== exact,
      message: `Exactement ${exact} éléments doivent être sélectionnés.`
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
      {/* <div 
        { ...selectContainerProps}
        className={twMerge(`relative`, selectContainerProps?.className)}
      > */}
        <select { ...mergeProps("select", props => ({
          ...props,
          ...mergeQuickProps(["name", "multiple", "disabled", "readOnly", "onBlur", "onFocus"]),
          value: currentValue,
          onChange: e => {
            handleSelectOnChange(e);
            applyFunctionIfNotNil(props.onChange, e);
          },
          className: `py-2 pr-7 pl-2 w-full truncate whitespace-nowrap overflow-hidden rounded-app-md border border-border truncate
          outline-none active:brightness-soft duration-(--really-quick) bg-strong-bg inset-shadow-sm`
        }))}>
          {/* <option disabled { ...optionProps}>{placeholder}</option> */}
          {!isEmpty(options) && 
            options.map((option, OI) => {
              const optionValue = isObject(option) ? option.value : option;
              const optionLabel = isObject(option) ? option.label : option;

              return (
                <option key={`option${OI}`} { ...mergeProps("option", props => ({
                  ...props,
                  value: optionValue,
                  className: `truncate`
                }))}>
                  {optionLabel}
                </option>
              );
            })
          }
        </select>
        {/* <IoIosArrowDown
          { ...iconProps}
          className={twMerge(`right-2 z-10 pointer-events-none absolute-v-center`, iconProps?.className)}
        /> */}
      {/* </div> */}
    </Label>
  );
};

Select.propTypes = propTypes;