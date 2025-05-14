export function isString(value) {
    return typeof value === "string";
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

export function isObject(value) {
    return typeof value === "object";
}
  
export function isFunction(value) {
    return typeof value === "function";
}

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
  
  
export function isEmpty(value) {
    if (isInvalid(value)) {
        return true;
    }
    
    if (isString(value) || isArray(value)) {
        return value.length === 0;
    }

    if (isObject(value)) {
        return Object.keys(value).length === 0;
    }

    if (isFunction(value)) {
        const functionString = value.toString().replace(/\s/g, "");
        return functionString === `function${value}(){}` || functionString === "()=>{}";
    }

    return false;
}

export function toArray(value){
    return isArray(value) ? value : [value];
}

export function applyFunctionIfNotNil(value, ...params) {
    if (!isNil(value)) {
        return value(params);
    }

    return undefined;
}

export function applyFunctionIfFunction(value, ...params) {
    if (!isFunction(value)) {
        return value(params);
    }

    return undefined;
}
