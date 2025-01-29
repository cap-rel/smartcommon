export function isUndefined(value) {
    return value === undefined;
}
  
export function isNull(value) {
    return value === null;
}
  
export function isNil(value) { 
    return isUndefined(value) || isNull(value);
}
  
export function isInvalid(value) {
    return isNil(value) || Number.isNaN(value);
}
  
export function isString(value) {
    return typeof value === "string";
}

export function isStringEmpty(value) {
    if (isInvalid(value)) {
        return true;
    }
    
    if (isString(value)) {
        return value.length === 0;
    }

    return false;
}

// export function isString(value) {
//     return isStringStrict(value) || isNumberStrict(value);
// }

export function isNumber(value) {
    return typeof value === "number" && !Number.isNaN(value);  
}
  
// export function isNumber(value) {
//     return isNumberStrict(value) || (isStringStrict(value) && isNumberStrict(parseFloat(value.trim())));
// }
  
export function isBoolean(value) {
    return typeof value === "boolean";
}

// export function isBoolean(value) {
//     return isBooleanStrict(value) || value === 1 || value === 0 || value.trim() === "1" || value.trim() === "0" || value.trim() === "true" || value.trim() === "false";
// }
  
export function isArray(value) {
    return Array.isArray(value);
}

export function isArrayEmpty(value) {
    if (isInvalid(value)) {
        return true;
    }
    
    if (isArray(value)) {
        return value.length === 0;
    }

    return false;
}

export function isObject(value) {
    return typeof value === "object";
}

export function isObjectEmpty(value) {
    if (isInvalid(value)) {
        return true;
    }
    
    if (isObject(value)) {
        return Object.keys(value).length === 0;
    }

    return false;
}
  
export function isFunction(value) {
    return typeof value === "function";
}

export function isFunctionEmpty(value) {
    if (isInvalid(value)) {
        return true;
    }
    
    if (isFunction(value)) {
        const functionString = value.toString().replace(/\s/g, "");
        return functionString === `function${value}(){}` || functionString === "()=>{}";
    }

    return false;
}
  
export function isEmpty(value) {
    return isStringEmpty(value) || isArrayEmpty(value) || isObjectEmpty(value) || isFunctionEmpty(value);
}