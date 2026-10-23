import { useContext, useEffect, useRef, useState } from "react";
import { fromPairs, isEqual, isNil, isUndefined, map } from "lodash";

import { FormContext } from "lib/components";

export const useField = (props) => {
  const { name, defaultValue, value, onChange, errors, formSubmitted, onError } = props;

  const formContext = useContext(FormContext);

  const { isFormSubmitting, isFormSubmitted: contextIsFormSubmitted, values, setField } = formContext ?? {};

  // Three modes, like a native input:
  // - inside a mounted <Form>, a named field without `value` lives in the form;
  // - with a `value` prop, the caller owns the value (controlled);
  // - otherwise the field keeps its own value (uncontrolled), seeded from
  //   defaultValue. Testing the FormContext object itself (always defined)
  //   used to route that last case to the form and crash on `values[name]`.
  const isControlledByForm = !isNil(formContext) && !isUndefined(name) && isUndefined(value);
  const isUncontrolled = !isControlledByForm && isUndefined(value);

  // Undefined until the user edits the field: an untouched field shows
  // defaultValue, including one that arrives after mount (async data).
  const [localValue, setLocalValue] = useState(undefined);

  const currentValue = isControlledByForm
    ? values[name]
    : isUncontrolled
      ? (isUndefined(localValue) ? defaultValue : localValue)
      : value;

  // const currentErrors = fromPairs(map(errors(currentValue), (error, key) => [key, error.condition]));

  // Track which field names have been initialized (supports dynamic name changes)
  const initializedRef = useRef({});
  // Track previous defaultValue to detect when async data arrives (undefined -> value)
  const prevDefaultValueRef = useRef(defaultValue);

  // Register field in form context on mount or when relevant props change
  // Handles two scenarios:
  // 1. Initial mount: field is registered with its defaultValue
  // 2. Async defaultValue: when defaultValue changes from undefined to a value
  //    (e.g., when data is fetched from API after mount)
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
  }, [name, defaultValue, isControlledByForm, setField]);

  // Report each validation rule result (rule key, boolean) to the consumer's
  // onError, but only when a result actually flips. Standalone pages (no
  // smartcommon <Form>) aggregate these booleans to decide whether a submit
  // may proceed; before this channel existed the aggregation stayed empty.
  const reportedErrorsRef = useRef(null);

  useEffect(() => {
    if (isUndefined(onError)) return;

    const conditions = fromPairs(map(errors(currentValue), (error, key) => [key, Boolean(error.condition)]));

    if (isEqual(conditions, reportedErrorsRef.current)) return;

    reportedErrorsRef.current = conditions;
    map(conditions, (condition, key) => onError(key, condition));
  });

  const setValue = (newValue) => {
    if (!isEqual(currentValue, newValue)) {
      const newErrors = errors(newValue);

      if (isControlledByForm) {
        setField({ name, value: newValue, errors: newErrors });
      } else if (isUncontrolled) {
        setLocalValue(newValue);
      }
      // In every mode: a form-bound field used to drop the onChange its
      // caller passed, so a component reading its own input from onChange
      // silently got nothing once rendered inside a <Form>.
      if (onChange) {
        onChange(newValue, newErrors);
      }
    }
  };

  return {
    // Rule objects ({ condition, message }) for Label, in both modes: the
    // form context only stores the booleans (for its submit gate), so the
    // messages are recomputed from the current value.
    filteredErrors: errors(currentValue),
    currentValue,
    setValue,
    isFormSubmitting,
    // A `formSubmitted` prop (standalone pages) forces error display the same
    // way the <Form> context does after a submit attempt.
    isFormSubmitted: formSubmitted || contextIsFormSubmitted
  };
};
