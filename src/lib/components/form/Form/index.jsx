import { throwTypeError } from 'lib/utils';

import { FormContext } from './context';

export function Form(props) {
  const { form, children } = props;

  throwTypeError({ value: form, name: "form", type: ["plain object"] });

  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
}