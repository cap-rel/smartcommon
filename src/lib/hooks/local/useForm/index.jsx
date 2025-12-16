import { forEach, some } from "lodash";

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

  const setField = ({ name, value, errors }) => {
    st.set(`values.${name}`, value);

    forEach(errors, (error, key) => st.set(`errors.${name}.${key}`, error.condition));
  };

  const submit = async (e) => {
    e.preventDefault();

    st.set("isFormSubmitted", true);

    if (!some(errors, Boolean)) {
      st.set("isFormSubmitting", true);
      await onSubmit();
      st.set("isFormSubmitting", false);
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