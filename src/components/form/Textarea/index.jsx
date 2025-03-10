import { useStates } from "../../../hooks";
import { Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

export const Textarea = ({
  label,
  labelRow = false,
  help,
  onValueChange = () => {},

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  textareaProps,
  ...props
}) => {
  const textareaPs = { ...props, ...textareaProps };

  const { required, readOnly, disabled, id, value, defaultValue } = textareaPs;

  const textareaPsForLabel = { required, readOnly, disabled, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...textareaPsForLabel };

  const { states, set } = useStates({
    localValue: defaultValue ?? ""
  });

  const { localValue } = states;

  const realValue = value ?? localValue;

  const handleTextareaOnChange = (e) => {
    const newValue = e.target.value;
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Label { ...allLabelPs}>
      <textarea 
        rows={5}
        placeholder={`${label}...` ?? ""}
        { ...textareaPs}
        onChange={handleTextareaOnChange}
        value={realValue}
        className={twMerge(`disabled:brightness-90 p-2 rounded-md border outline-none placeholder-soft-text border-soft-border bg-strong duration-100 focus:ring-2 ring-primary`, textareaPs?.className)}
      >
      </textarea>
    </Label>
  );
};

Textarea.propTypes = propTypes;
