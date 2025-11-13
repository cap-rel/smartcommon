import { isNil, isUndefined } from "../../utils";
import { useStates } from "../useStates"

export const useLocalValue = (localValue, value, onChange, errors) => {
    const { states, set } = useStates({ localValue });

    const currentValue = value ?? states.localValue;

    const setValue = (newValue) => {
        if (isUndefined(value)) {
            set("localValue", newValue);
        } else {
            onChange(newValue);
        }
    };

    return { currentValue, setValue };
}