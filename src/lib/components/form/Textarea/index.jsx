import { useEffect } from "react";
import { isNil } from "lodash";

import { useField, useVariantMerger } from "lib/hooks";
import { Label } from "lib/components";
import { applyFunctionIfNotNil, isEmptyValue } from "lib/utils";

import { propTypes, DEFAULT_LABELS } from "./props";

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
    labels: userLabels = {},
  } = variantProps;

  const labels = { ...DEFAULT_LABELS, ...userLabels };

  const errors = (currentValue) => ({
    required: { 
      condition: required && isEmptyValue(currentValue),
      message: labels.requiredError
    },
    minLength: { 
      condition: !isNil(minLength) && currentValue?.length < minLength,
      message: labels.minLengthError(minLength)
    },
    length: { 
      condition: !isNil(length) && currentValue?.length !== length,
      message: labels.lengthError(length)
    },
    maxLength: { 
      condition: !isNil(maxLength) && currentValue?.length > maxLength,
      message: labels.maxLengthError(maxLength)
    },
    pattern: { 
      condition: !isNil(pattern) && !pattern.test(currentValue),
      message: patternError 
    },
  });

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors, formSubmitted: variantProps.formSubmitted, onError: variantProps.onError });

  const handleValueOnChange = (e) => {
    if (!disabled && !readOnly && !isFormSubmitting) {
      setValue(e.target.value);
    }
  };

  return (
    <Label 
      { ...variantProps}
      showErrors={isFormSubmitted}
      errors={filteredErrors}
      mergeProps={mergeProps}
    >
      <textarea { ...mergeProps("textarea", props => ({
        ...props,
        // The Label points at this id (htmlFor): without it, clicking the label
        // does not focus the field and the field has no accessible name.
        id,
        placeholder,
        disabled,
        readOnly,
        rows: rows ?? 5,
        cols,
        wrap,
        name,
        value: currentValue ?? "",
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
