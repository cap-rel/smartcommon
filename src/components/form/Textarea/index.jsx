import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { applyFunctionIfNotNil, isNil } from "../../../globals/functions";

export const Textarea = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Textarea", props);

  const { extractedLabelProps, filteredProps } = useLabel(variantProps);

  const {
    defaultValue,
    onChange = () => {},
    value
   } = filteredProps;

  const { currentValue, setValue } = useValue(defaultValue ?? "", value, onChange);

  return (
    <Label { ...extractedLabelProps} mergeProps={mergeProps}>
      <textarea { ...mergeProps("textarea", props => ({
        // rows: 5,
        ...props,
        ...mergeQuickProps(props, ["placeholder", "required", "disabled", "readOnly",
        ["rows", 5], "cols", "wrap", "minLength", "maxLength", "name"]),
        value: currentValue,
        onChange: e => setValue(e.target.value),
        className: `min-w-0 w-full disabled:brightness-soft p-app-xs
        rounded-app-md border outline-none placeholder-soft-text
        border-border bg-soft-bg duration-(--instant) focus:ring-1 
        ring-primary focus:border-primary`,
      }))}>
      </textarea>
    </Label>
  );
};

Textarea.propTypes = propTypes;
