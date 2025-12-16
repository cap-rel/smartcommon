import { useEffect } from "react";

import { useField, useVariantMerger } from "lib/hooks";
import { Label } from "lib/components";
import { applyFunctionIfNotNil, isEmpty, isNil } from "lib/utils";

import { propTypes } from "./props";

export const Textarea = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("Textarea", props);

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

  const { currentValue, setValue } = useField(defaultValue ?? "", value, onChange, errors, onError, id);

  const handleValueOnChange = (e) => {
    if (!disabled && !readOnly) {
      setValue(e.target.value);
    }
  };

  return (
    <Label 
      { ...variantProps}
      errors={errors}
      mergeProps={mergeProps}
    >
      <textarea { ...mergeProps("textarea", props => ({
        ...props,
        placeholder,
        disabled,
        readOnly,
        rows: 5,
        cols,
        wrap,
        name,
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
