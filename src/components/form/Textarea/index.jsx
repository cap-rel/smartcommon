import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../../form";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { applyFunctionIfNotNil, isNil } from "../../../globals/functions";
import { useEffect } from "react";

export const Textarea = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Textarea", props);

  const {
    id,
    name,
    defaultValue,
    value,
    onChange = () => {},

    required,
    disabled,
    readOnly,

    minLength,
    length,
    maxLength,
    pattern,
    patternError,

    placeholder,
    rows,
    cols,
    wrap,

    onError = () => {}
   } = variantProps;

  const { currentValue, setValue } = useValue(defaultValue ?? "", value, onChange);

  const handleValueOnChange = (e) => {
    if (!disabled && !readOnly) {
      setValue(e.target.value);
    }
  };

  const errors = {
    required: { 
      condition: required && isEmpty(currentValue),
      message: "Ce champ est requis." 
    },
    minLength: { 
      condition: !isNil(minLength) && currentValue?.length < minLength,
      message: `La longueur doit être de ${minLength} caractères au minimum.`
    },
    length: { 
      condition: !isNil(length) && currentValue?.length !== length,
      message: `La longueur doit être de ${length} caractères exactement.`
    },
    maxLength: { 
      condition: !isNil(maxLength) && currentValue?.length > maxLength,
      message: `La valeur doit être de ${maxLength} au maximum.`
    },
    pattern: { 
      condition: !isNil(pattern) && !pattern.test(currentValue),
      message: patternError 
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
      <textarea { ...mergeProps("textarea", props => ({
        ...props,
        ...mergeQuickProps(["placeholder", "disabled", "readOnly", ["rows", 5], "cols", "wrap", "name"]),
        value: currentValue,
        onChange: e => {
          handleValueOnChange(e);
          applyFunctionIfNotNil(props.onChange, e);
        },
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
