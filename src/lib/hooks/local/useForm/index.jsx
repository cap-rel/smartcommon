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
    values: defaultValues,
    errors: {},
  }

  const st = useStates({ initialStates, debug: false });

  const { values, errors } = st.values;

  const setField = ({ name, value, errors }) => {
    st.set(`values.${name}`, value);
    forEach(errors, (error, key) => st.set(`errors.${name}.${key}`, error.condition));
  };

  const valuesCopy = { ...values };
  const errorsCopy = { ...errors};

  Object.defineProperties(valuesCopy, {
    set:{
      value: (key, value) => st.set(`values.${key}`, value).values,
      enumerable: false
    },
    unset:{
      value: (key, value) => st.unset(`values.${key}`, value).values,
      enumerable: false
    }
  });

  Object.defineProperties(errorsCopy, {
    set:{
      value: (key, value) => st.set(`errors.${key}`, value).errors,
      enumerable: false 
    },
    unset:{
      value: (key, value) => st.unset(`errors.${key}`, value).errors,
      enumerable: false
    }
  });

  return {
    values: valuesCopy,
    errors: errorsCopy,

    setField,
  };
};