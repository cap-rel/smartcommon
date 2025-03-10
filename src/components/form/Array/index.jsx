import { useStates } from "../../../hooks";
import { Input, Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { isEmpty, isNil } from "../../../globals/functions";

export const Array = ({
  label,
  labelRow = false,
  help,
  onValueChange = () => {},

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  arrayContainerProps,
  arrayInputProps,
  tagsContainerProps,
  tagProps,
  inputProps,
  ...props
}) => {
  const inputPs = { ...props, ...inputProps };

  const { required, readOnly, disabled, id, value, defaultValue } = inputPs;

  const inputPsForLabel = { required, readOnly, disabled, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

  const { states, set } = useStates({
    localValue: defaultValue ?? [],
    inputValue: ""
  });

  const { inputValue, localValue } = states;

  const realValue = value ?? localValue;

  const addItem = (e) => {
    if (!isEmpty(inputValue.trim()) && e.key === "Enter") {
      const newValue = [...realValue, inputValue];
      if (isNil(value)) {
        set("localValue", newValue);
      } else {
        onValueChange(newValue);
      }
      set("inputValue", "");
    }
  };

  const deleteItem = (index) => {
    const newValue = [...realValue.slice(0, index), ...realValue.slice(index + 1)];
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  }

  return (
    <Label { ...allLabelPs}>
      <div 
        { ...arrayContainerProps}
        className={twMerge(`gap-2 col`, arrayContainerProps?.className)}
      >
        <Input 
          placeholder={`Ajouter...`}
          { ...arrayInputProps}
          onValueChange={value => set("inputValue", value)}
          value={inputValue}
          onKeyDown={addItem}
        />
        <div 
          { ...tagsContainerProps}
          className={twMerge(`gap-2 wrap-v-center`, tagsContainerProps?.className)}
        >
          {!isEmpty(realValue) &&
            realValue.map((item, II) => 
              <div 
                key={`item${II}`}
                { ...tagProps}
                onClick={() => deleteItem(II)}
                className={twMerge(`px-2 py-1 font-semibold text-sm tracking-wide uppercase text-primary bg-primary/10 rounded-md`, tagProps?.className)}
              >
                {item}
                <input
                  { ...inputPs}
                  onChange={() => {}}
                  value={item}
                  className={twMerge(`hidden`, inputPs?.className)}
                />
              </div>
            )
          }
        </div>
      </div>
    </Label>
  );
};

Array.propTypes = propTypes;
