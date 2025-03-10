import { twMerge } from "tailwind-merge";
import { Label } from "../../form";
import { propTypes } from "./props";
import { IoIosArrowDown } from "react-icons/io";
import { useStates } from "../../../hooks";
import { isEmpty, isNil, isObject } from "../../../globals/functions";
import { useEffect } from "react";

// TODO Add attributes to options like disabled, maybe props

export const Select = ({
  label,
  labelRow = false,
  help,
  onValueChange = () => {},
  options = [],

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  selectContainerProps,
  selectProps,
  optionProps,
  iconProps,
  ...props
}) => {
  const selectPs = { ...props, ...selectProps };
  const { required, readOnly, disabled, id, multiple, value, defaultValue } = selectPs;

  const selectPsForLabel = { disabled, required, readOnly, id };

  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...selectPsForLabel };

  const { states, set } = useStates({
    localValue: defaultValue ?? (multiple ? [] : "")
  });

  const { localValue } = states;

  const realValue = value ?? localValue;

  const handleSelectOnChange = (e) => {
    const newValue = multiple ? Array.from(e.target.selectedOptions, option => option.value) : e.target.value;
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Label { ...allLabelPs}>
      <div 
        { ...selectContainerProps}
        className={twMerge(`relative`, selectContainerProps?.className)}
      >
        <select
          { ...selectPs}
          onChange={handleSelectOnChange}
          value={realValue}
          className={twMerge(`py-2 pr-7 pl-2 w-full rounded-md border border-soft-border appearance-none outline-none active-button-effect bg-strong`, selectPs?.className)}
        >
          {/* <option disabled { ...optionProps}>{placeholder}</option> */}
          {!isEmpty(options) && 
            options.map((option, OI) => 
              isObject(option)
                ? <option 
                    key={OI}
                    { ...optionProps}
                    value={option.value} 
                  >
                    {option.label}
                  </option>
                : <option 
                    key={OI}
                    { ...optionProps}
                    value={option}
                  >
                    {option}
                  </option>
            )
          }
        </select>
        <IoIosArrowDown
          { ...iconProps}
          className={twMerge(`right-2 z-10 pointer-events-none absolute-v-center`, iconProps?.className)}
        />
      </div>
    </Label>
  );
};

Select.propTypes = propTypes;