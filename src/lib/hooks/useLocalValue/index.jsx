import { isUndefined } from "lib/utils";
import { useState } from "react";

export const useLocalValue = (localValue, value, onChange, errors) => {
    const [state, set] = useState(localValue)

    const currentValue = value ?? state;

    const setValue = (newValue) => {
        if (isUndefined(value)) {
            set(newValue);
        } else {
            onChange(newValue);
        }
    };

    return { currentValue, setValue };
}