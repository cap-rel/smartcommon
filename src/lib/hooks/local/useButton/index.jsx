import { useContext } from "react";

import { FormContext } from "lib/components";

export const useField = (name) => {
    const { isFormSubmitting, values, setFieldValue } = useContext(FormContext);

  return {
    currentValue: values[name],
    setValue: setFieldValue,
    
    readOnly: isFormSubmitting,
    
    fieldProps: {
      value: values[name] ?? '',
      onChange: e => setFieldValue(name, e.target.value),
    },
  };
};

   // form: {}
    // errors: {}
    // readOnly
    // onChange and value