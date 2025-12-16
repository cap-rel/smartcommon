import { some } from "lodash";

import { throwTypeError } from "lib/utils";
import { useStates } from "lib/hooks";

export const useForm = (props = {}) => {
  throwTypeError({ value: props, name: "props", type: ["plain object"] });

  const { defaultValues = {}, onSubmit = () => {}, debug } = props;

  throwTypeError({ value: defaultValues, name: "defaultValues", type: ["plain object"] });
  throwTypeError({ value: onSubmit, name: "onSubmit", type: ["function"] });

  const initialStates = {
    values: defaultValues,
    errors: {},
    isFormSubmitting: false,
    isFormSubmitted: false
  }

  const st = useStates({ initialStates });

  const { values, errors, isFormSubmitting, isFormSubmitted } = st.values;

  const setField = (name, value) => {
    st.set(`values.${name}`, value);
    st.set(`errors.${name}`, value);
  };

  const submit = async () => {
    set("isFormSubmitted", true);

    if (!some(errors, Boolean)) {
      set("isFormSubmitting", true);
      await onSubmit();
      set("isFormSubmitting", false);
    }
  };

  return {
    values,
    errors,

    setField,

    submit,
    isFormSubmitting,
    isFormSubmitted
  };
};