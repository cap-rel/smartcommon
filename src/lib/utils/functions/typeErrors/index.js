import { isNil, isArray, forEach, toArray, isString, isNumber, isBoolean, isUndefined, isNull, isPlainObject, isObject, isFunction, isDate, set, some, join } from "lodash";

export function throwTypeError({ value, name, type, required }) {
    const isValueUndefined = isUndefined(value);

    if (required && isValueUndefined) {
        throw new Error(`${name} can not be undefined.`);
    }

    if (!isArray(type)) {
        return;
    }

    let typeMatches = { undefined: isValueUndefined };

    forEach(type, (t) => {
        switch (t) {
            case "string": return set(typeMatches, t, isString(value)); 
            case "number": return set(typeMatches, t, isNumber(value)); 
            case "boolean": return set(typeMatches, t, isBoolean(value)); 
            case "null": return set(typeMatches, t, isNull(value)); 
            case "nil": return set(typeMatches, t, isNil(value));
            case "object": return set(typeMatches, t, isObject(value));
            case "plain object": return set(typeMatches, t, isPlainObject(value)); 
            case "array": return set(typeMatches, t, isArray(value)); 
            case "function": return set(typeMatches, t, isFunction(value)); 
            case "date": return set(typeMatches, t, isDate(value)); 
        }
    });

    if (!some(typeMatches, Boolean)) {
        throw new Error(`${name} must be ${join(type, " | ")}.`);
    }
}
