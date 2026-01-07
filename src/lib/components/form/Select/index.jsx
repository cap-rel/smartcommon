import { isNil, isObject, isEmpty } from "lodash";

import { Label } from "lib/components";
import { useField, useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";

import { propTypes } from "./props";

// TODO Add attributes to options like disabled, maybe props

export const Select = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("Select", props);

  const {
    id,
    name,
    value,
    defaultValue,
    onChange = () => {},
showErrors,

    required,
    disabled,
    readOnly,
    min,
    exact,
    max,
    placeholder,

    multiple,
    options = [],
  } = variantProps;

  const errors = (currentValue) => ({
    required: {
      condition: required && isEmpty(currentValue),
      message: "1 élément doit être sélectionné au minimum."
    },
    min: {
      condition: !isNil(min) && multiple && currentValue?.length < min,
      message: `${min} éléments doivent être sélectionnés au minimum.`
    },
    max: {
      condition: !isNil(max) && multiple && currentValue?.length > max,
      message: `${max} éléments doivent être sélectionnés au maximum.`
    },
    exact: {
      condition: !isNil(exact) && multiple && currentValue?.length !== exact,
      message: `Exactement ${exact} éléments doivent être sélectionnés.`
    },
    notAnOption: {
      condition: !isEmpty(currentValue) && !options.includes(currentValue),
      message: "La valeur sélectionnée ne fait pas partie des options"
    }
  });

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

  const handleSelectOnChange = e => {
    if (!disabled && !readOnly && !isFormSubmitting) {
      const newValue = multiple ? Array.from(e.target.selectedOptions, option => option.value) : e.target.value;
      setValue(newValue);
    }
  };

  return (
    <Label 
      { ...variantProps}
      showErrors={isFormSubmitted ?? showErrors}
      errors={filteredErrors}
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
          outline-none ${disabled ? "brightness-soft" : "active:brightness-soft"} duration-(--really-quick) bg-strong-bg inset-shadow-sm`
        }))}>
          <option value="">{placeholder}</option>
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