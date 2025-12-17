import { throwTypeError } from 'lib/utils';
import { useStates } from "lib/hooks";

import { FormContext } from './context';
import { every, some } from 'lodash';

export function Form(props) {
  const { form = {}, onPreSubmit = () => {}, onSubmit = () => {}, onPostSubmit = () => {}, children } = props;

  throwTypeError({ value: form, name: "form", type: ["plain object"] });
  throwTypeError({ value: onPreSubmit, name: "onPreSubmit", type: ["function"] });
  throwTypeError({ value: onSubmit, name: "onSubmit", type: ["function"] });
  throwTypeError({ value: onPostSubmit, name: "onPostSubmit", type: ["function"] });

  const initialStates = { isFormSubmitting: false, isFormSubmitted: false };

  const st = useStates({ initialStates });

  const submit = async (e) => {
    e.preventDefault();

    await onPreSubmit();

    st.set("isFormSubmitted", true);

    if (every(form.errors, (field) => !some(field, Boolean))) {
      st.set("isFormSubmitting", true);
      await onSubmit();
      st.set("isFormSubmitting", false);
    }

    onPostSubmit();
  };

  return (
    <FormContext.Provider value={{ ...form, submit, ...st.values }}>
      {children}
    </FormContext.Provider>
  );
}