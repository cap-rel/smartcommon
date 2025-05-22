import { twMerge } from "tailwind-merge";
import { Label } from "../../form";
import { propTypes } from "./props";
import { IoIosArrowDown } from "react-icons/io";
import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { applyFunctionIfNotNil, isEmpty, isNil, isObject } from "../../../globals/functions";

// TODO Add attributes to options like disabled, maybe props

// label,
// labelRow = false,
// help,
// onValueChange = () => {},
// options = [],

// containerProps,
// labelContainerProps,
// labelProps,
// requiredStarProps,
// helpProps,
// selectContainerProps,
// selectProps,
// optionProps,
// iconProps,
// ...props

export const Select = (props) => {
   const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Select", props);
  
    const { extractedLabelProps, filteredProps } = useLabel(variantProps);
  
    const { 
      id,
      icon,
      loading,
      hasCopyButton,
      options,
      multiple,
      defaultValue,
      value,
      onChange = () => {},
    } = filteredProps;

    const { currentValue, setValue } = useValue(defaultValue, value, onChange);
  
  const handleSelectOnChange = e => {
    const newValue = multiple ? Array.from(e.target.selectedOptions, option => option.value) : e.target.value;
    setValue(newValue);
  };

  return (
    <Label 
      { ...extractedLabelProps}
      mergeProps={mergeProps}
    >
      {/* <div 
        { ...selectContainerProps}
        className={twMerge(`relative`, selectContainerProps?.className)}
      > */}
        <select { ...mergeProps("select", props => ({
          ...props,
          ...mergeQuickProps(props, ["multiple", "name", "disabled", "required", "readOnly", "onBlur", "onFocus"]),
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