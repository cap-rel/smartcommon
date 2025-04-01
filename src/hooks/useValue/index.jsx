import { isNil } from "../../globals";
import { useStates } from "../useStates"

export const useValue = (localValue, value, onValueChange) => {
    const { states, set } = useStates({ localValue });

    const currentValue = value ?? states.localValue;

    const setValue = (newValue) => {
        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue);
        }
    }

    return { currentValue, setValue };
}