import { isNil, isArray, forEach, toArray, isString, isNumber, isBoolean, isUndefined, isNull, isPlainObject, isObject, isFunction, isDate, set, some, join } from "lodash";

export const throwTypeError = ({ value, name, type, required }) => {
    const isValueUndefined = isUndefined(value);

    if (required && isValueUndefined) {
        throw new Error(`${name} can not be undefined.`);
    }

    if (!isArray(type)) {
        return;
    }

    let matchesType = { undefined: isValueUndefined };

    forEach(type, (t) => {
        switch (t) {
            case "string": set(errors, t, isString(value)); break; 
            case "number": set(errors, t, isNumber(value)); break; 
            case "boolean": set(errors, t, isBoolean(value)); break; 
            case "null": set(errors, t, isNull(value)); break; 
            case "nil": set(errors, t, isNil(value)); break;
            case "object": set(errors, t, isObject(value)); break;
            case "plain object": set(errors, t, isPlainObject(value)); break; 
            case "array": set(errors, t, isArray(value)); break; 
            case "function": set(errors, t, isFunction(value)); break; 
            case "date": set(errors, t, isDate(value)); break; 
        }
    });

    if (!some(matchesType, true)) {
        throw new Error(`${name} must be ${join(type, " | ")}.`);
    }
};
