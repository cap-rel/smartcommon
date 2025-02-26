import { Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";

export const Textarea = ({
  label,
  labelRow = false,
  help,

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  textareaProps,
  ...props
}) => {
  const textareaPs = { ...props, ...textareaProps };

  const { required, readOnly, disabled, id } = textareaPs;

  const textareaPsForLabel = { required, readOnly, disabled, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...textareaPsForLabel };

  return (
    <Label { ...allLabelPs}>
      <textarea 
        rows={5}
        { ...textareaPs}
        className={twMerge(`disabled:brightness-90 disabled:cursor-not-allowed p-2 rounded-md border outline-none placeholder-soft-text border-soft-border bg-strong focus:ring-2 ring-primary`, textareaPs?.className)}
      >
      </textarea>
    </Label>
  );
};

Textarea.propTypes = propTypes;
