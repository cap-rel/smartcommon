import { isUndefined } from "lib/utils";
import { useState } from "react";

export const useField = (localValue, value, onChange, errors, onError, id) => {
    const [state, set] = useState(localValue)

    const currentValue = value ?? state;

    const setValue = (newValue) => {
        if (isUndefined(value)) {
            set(newValue);
        } else {
            onChange(newValue);
        }

        Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition));
    };

    return { currentValue, setValue };
}