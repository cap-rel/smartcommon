import { useContext, useEffect, useRef } from "react";
import { fromPairs, isEqual, isUndefined } from "lodash";

import { FormContext } from "lib/components";

export const useField = (props) => {
  const { name, defaultValue, value, onChange, errors } = props;

  const isControlledByForm = !isUndefined(FormContext) && !isUndefined(name) && isUndefined(value);

  const { isFormSubmitting, isFormSubmitted, values, errors: formErrors, setField } = useContext(FormContext) ?? {};

  const currentValue = isControlledByForm ? values[name] : value;

  // const currentErrors = fromPairs(map(errors(currentValue), (error, key) => [key, error.condition]));

  // Track which field names have been initialized (supports dynamic name changes)
  const initializedRef = useRef({});
  // Track previous defaultValue to detect when async data arrives (undefined -> value)
  const prevDefaultValueRef = useRef(defaultValue);

  // Register field in form context on mount or when relevant props change
  // Handles two scenarios:
  // 1. Initial mount: field is registered with its defaultValue
  // 2. Async defaultValue: when defaultValue changes from undefined to a value
  //    (e.g., when data is fetched from API after initial render)
  useEffect(() => {
    if (isControlledByForm) {
      const wasUndefined = prevDefaultValueRef.current === undefined;
      const isNowDefined = defaultValue !== undefined;
      // Re-init if: never initialized for this name OR defaultValue just became defined
      const shouldInit = !initializedRef.current[name] || (wasUndefined && isNowDefined);

      if (shouldInit) {
        // Use errors(defaultValue) not errors(currentValue) since currentValue
        // is not yet set in form context at initialization time
        setField({ name, value: defaultValue, errors: errors(defaultValue) });
        initializedRef.current[name] = true;
      }
      prevDefaultValueRef.current = defaultValue;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, defaultValue, isControlledByForm, setField]);

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