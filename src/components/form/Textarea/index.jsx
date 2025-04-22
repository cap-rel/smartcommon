import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

export const Textarea = (props) => {
  const { variantProps, mergeProps } = useVariantToProps("textarea", props);

  const { extractedLabelProps, filteredProps } = useLabel(variantProps);

  const { textareaProps = {} } = filteredProps;

  const { value, defaultValue, onChange = () => {} } = textareaProps;

  const { currentValue, setValue } = useValue(defaultValue, value, onChange);

  const handleTextareaOnChange = e => setValue(e.target.value);

  return (
    <Label { ...extractedLabelProps} mergeProps={mergeProps}>
      <textarea { ...mergeProps("textarea", props => ({
        rows: 5,
        ...props,
        value: currentValue,
        onChange: handleTextareaOnChange,
        className: `min-w-0 disabled:brightness-soft p-app-xs rounded-app-md border outline-none placeholder-soft-text border-border bg-soft-bg duration-(--really-quick) focus:ring-1 ring-primary focus:border-primary`
      }))}>
      </textarea>
    </Label>
  );
};

Textarea.propTypes = propTypes;
