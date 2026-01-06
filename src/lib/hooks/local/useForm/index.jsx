import { forEach, isString, isUndefined } from "lodash";

import { throwTypeError } from "lib/utils";
import { useLibConfig, useStates } from "lib/hooks";

export const useForm = (props = {}) => {
  throwTypeError({ value: props, name: "props", type: ["plain object"] });

  const { defaultValues = {} } = props;

  const libConfig = useLibConfig();
  
  const debug = isUndefined(props.debug) ? libConfig.debug : props.debug;

  throwTypeError({ value: defaultValues, name: "defaultValues", type: ["plain object"] });

  const initialStates = {
    isFormSubmitting: false,
    isFormSubmitted: false,
    values: defaultValues,
    errors: {},
  }

  const st = useStates({ initialStates, debug: false });

  // const { values, errors } = st.values;

  const setField = ({ name, value, errors }) => {
    st.set(`values.${name}`, value);
    forEach(errors, (error, key) => st.set(`errors.${name}.${key}`, error.condition));
  };

  // const path = (prop, key) => `${prop}${key ? `.${key}` : ""}`;

  // const propsValues = {
  //   values: { ...values },
  //   errors: { ...errors }
  // };

  // forEach(propsValues, (value, prop) => {
  //   Object.defineProperties(value, {
  //     get: {
  //       value: (key) => st.get(path(prop, key)),
  //       enumerable: false
  //     },
  //     set: {
  //       value: (key, value) => st.set(path(prop, key), value),
  //       enumerable: false
  //     },
  //     unset: {
  //       value: (key, value) => st.unset(path(prop, key), value),
  //       enumerable: false
  //     }
  //   });
  // });

  return {
    get: st.get,
    set: st.set,
    unset: st.unset,

    ...st.values,

    setField,
  };
};