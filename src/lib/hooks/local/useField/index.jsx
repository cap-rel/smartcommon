import { useContext, useEffect } from "react";
import { fromPairs, isEqual, isUndefined } from "lodash";

import { FormContext } from "lib/components";

export const useField = (props) => {
  const { name, defaultValue, value, onChange, errors } = props;

  const isControlledByForm = !isUndefined(FormContext) && !isUndefined(name) && isUndefined(value);

  const { isFormSubmitting, isFormSubmitted, values, errors: formErrors, setField } = useContext(FormContext) ?? {};

  const currentValue = isControlledByForm ? values[name] : value;

  // const currentErrors = fromPairs(map(errors(currentValue), (error, key) => [key, error.condition]));

  // && isUndefined(currentValue) don't know why it was there

  // TODO REVIEW - useEffect dependencies issue
  // ---------------------------------------------------------
  // This useEffect has an empty dependency array [] but uses:
  // - name, defaultValue, errors, setField, isControlledByForm, currentValue
  //
  // Current behavior: runs ONLY on mount (initialization)
  // Potential issues:
  // 1. If `name` changes dynamically, field won't re-register
  // 2. If `defaultValue` comes from async data (API), it will be undefined on first render
  // 3. Uses `errors(currentValue)` but currentValue isn't set yet at init
  //    -> should probably be `errors(defaultValue)` instead
  //
  // Options to discuss:
  // A) Keep as-is + add eslint-disable comment (if mount-only is intentional)
  // B) Add [name] to deps (re-init if field name changes)
  // C) Use a ref to track initialization + full deps array
  // ---------------------------------------------------------
  useEffect(() => {
    if (isControlledByForm) {
      setField({ name, value: defaultValue, errors: errors(currentValue) }); // TODO put the map
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = (newValue) => {
    if (!isEqual(currentValue, newValue)) {
      const newErrors = errors(newValue);

      if (isControlledByForm) {
        setField({ name, value: newValue, errors: newErrors });
      } else {
        onChange(newValue, newErrors);
      }
    }
  };

  return {
    filteredErrors: isControlledByForm ? formErrors[name] : {},
    currentValue,
    setValue,
    isFormSubmitting,
    isFormSubmitted
  };
};