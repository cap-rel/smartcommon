import { throwTypeError } from 'lib/utils';

import { FormContext } from './context';
import { every, some } from 'lodash';
import { useEffect, useState } from 'react';

export function Form(props) {
  const { form = {}, onPreSubmit = () => {}, onSubmit = () => {}, children } = props;

  throwTypeError({ value: form, name: "form", type: ["plain object"] });
  throwTypeError({ value: onPreSubmit, name: "onPreSubmit", type: ["function"] });
  throwTypeError({ value: onSubmit, name: "onSubmit", type: ["function"] });

  const { errors, isFormSubmitted } = form;

  // Counter that bumps on every submit attempt. We can't key the effect on
  // `isFormSubmitted` alone: it never resets to false (other form fields rely
  // on it to know whether to render their errors), so a second submit would
  // not change the value and the effect would not refire -- e.g. user enters
  // wrong credentials, gets the error toast, fixes the password, clicks
  // submit again and nothing happens. Bumping a dedicated token guarantees
  // each submit triggers exactly one effect run.
  const [submitToken, setSubmitToken] = useState(0);

  const submit = async (e) => {
    e.preventDefault();

    await onPreSubmit();

    form.set("isFormSubmitted", true);
    setSubmitToken((n) => n + 1);
  };

  useEffect(() => {
    if (submitToken === 0) return;
    const submitValues = async () => {
      if (every(errors, (field) => !Object.values(field).some(Boolean))) { // !some(field, Boolean)
        form.set("isFormSubmitting", true);
        await onSubmit();
        form.set("isFormSubmitting", false);
      }
    };

    submitValues();
  }, [submitToken]);

  return (
    <FormContext.Provider value={{ ...form, submit }}>
      {children}
    </FormContext.Provider>
  );
}