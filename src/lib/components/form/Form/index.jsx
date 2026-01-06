import { throwTypeError } from 'lib/utils';

import { FormContext } from './context';
import { every, some } from 'lodash';
import { useEffect } from 'react';

export function Form(props) {
  const { form = {}, onPreSubmit = () => {}, onSubmit = () => {}, children } = props;

  throwTypeError({ value: form, name: "form", type: ["plain object"] });
  throwTypeError({ value: onPreSubmit, name: "onPreSubmit", type: ["function"] });
  throwTypeError({ value: onSubmit, name: "onSubmit", type: ["function"] });

  const { errors, isFormSubmitted } = form;

  const submit = async (e) => {
    e.preventDefault();

    await onPreSubmit();

    form.set("isFormSubmitted", true);
  };

  useEffect(() => {
    const submitValues = async () => {
      if (every(errors, (field) => !some(field, Boolean))) {
        form.set("isFormSubmitting", true);
        await onSubmit();
        form.set("isFormSubmitting", false);
      }
    };

    if (isFormSubmitted) {
      submitValues();
    }
  }, [isFormSubmitted]);

  return (
    <FormContext.Provider value={{ ...form, submit }}>
      {children}
    </FormContext.Provider>
  );
}