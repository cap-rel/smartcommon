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

  useEffect(() => {
    if (isControlledByForm) {
      setField({ name, value: defaultValue, errors: errors(currentValue) }); // TODO put the map
    }
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