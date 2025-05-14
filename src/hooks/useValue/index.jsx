import { isNil, isUndefined } from "../../globals";
import { useStates } from "../useStates"

export const useValue = (localValue, value, onChange) => {
    const { states, set } = useStates({ localValue });

    const currentValue = value ?? states.localValue;

    const setValue = (newValue) => {
        if (isUndefined(value)) {
            set("localValue", newValue);
        } else {
            onChange(newValue);
        }
    }

    return { currentValue, setValue };
}