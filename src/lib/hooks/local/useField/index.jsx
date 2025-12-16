import { useContext, useEffect } from "react";
import { isEqual, isUndefined } from "lodash";

import { FormContext } from "lib/components";

export const useField = (props) => {
  const { name, defaultValue, value, onChange, errors } = props;

  const isControlledByForm = !isUndefined(FormContext) && !isUndefined(name) && isUndefined(value);

  const { isFormSubmitting, isFormSubmitted, values, setField } = useContext(FormContext) ?? {};

  const currentValue = isControlledByForm ? values[name] : value;

  const currentErrors = errors(currentValue);

  useEffect(() => {
    if (isControlledByForm && isUndefined(currentValue)) {
      setField({ name, value: defaultValue, errors: currentErrors }); // TODO put the map
    }
  }, []);

  const setValue = (newValue) => {
    if (!isEqual(currentValue, newValue)) {
      if (isControlledByForm) {
        setField({ name, value: newValue, errors: currentErrors });
      } else {
        onChange(newValue, currentErrors);
      }
    }
  };

  return {
    currentValue,
    setValue,
    isFormSubmitting,
    isFormSubmitted
  };
};