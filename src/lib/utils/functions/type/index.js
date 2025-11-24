export function isNumber(value, options = {}) {
     const {
        min,
        max,
        integer = false,
        equals,
        allowedValues,    
        func    
    } = options;

    if (typeof value !== "number") {
        return false;
    }

    if (integer && !Number.isInteger(value)) {
        return false;
    }

    if (typeof equals === "number" && equals !== value) {
        return false;
    }

    if (typeof min === "number" && value <= min) {
        return false;
    }

    if (typeof max === "number" && value >= max) {
        return false;
    }

    if (Array.isArray(allowedValues) && !allowedValues.includes(value)) {
        return false;
    }

    if (typeof func === "function" && !func(value)) {
        return false;
    }

    return true;
}

export function isString(value, options = {}) {
    const {
        minLength,
        maxLength,
        length,
        pattern,
        allowedValues,
        startsWith,
        endsWith,
        includes,
        func
    } = options;

    if (typeof value !== "string") {
        return false;
    }

    if (typeof length === "number" && value.length !== length) {
        return false;
    }

    if (typeof minLength === "number" && value.length <= minLength) {
        return false;
    }

    if (typeof maxLength === "number" && value.length >= maxLength) {
        return false;
    }

    if (pattern instanceof RegExp && !pattern.test(value)) {
        return false;
    }

    if (Array.isArray(allowedValues) && !allowedValues.includes(value)) {
        return false;
    }

    if (typeof startsWith === "string" && !value.startsWith(startsWith)) {
        return false;
    }

    if (typeof endsWith === "string" && !value.endsWith(endsWith)) {
        return false;
    }

    if (typeof includes === "string" && !value.includes(includes)) {
        return false;
    }

    if (typeof func === "function" && !func(value)) {
        return false;
    }

    return true;
}

export function isBoolean(value) {
    return typeof value === "boolean";
}

export function isDate(value) {
    return value instanceof Date && !isNaN(value);
}
  
export function isArray(value, options = {}) {
    const {
        length,
        minLength,
        maxLength,
        type,
        allowedValues,
        func
    } = options;

    if (!Array.isArray(value)) {
        return false;
    }

    if (typeof length === "number" && value.length !== length) {
        return false;
    }

    if (typeof minLength === "number" && value.length <= minLength) {
        return false;
    }

    if (typeof maxLength === "number" && value.length >= maxLength) {
        return false;
    }

    if (typeof type === "string") {
        if (!value.every(item => typeof item === type)) {
            return false;
        }
    }

    if (typeof type === "object") {
        if (!value.every(item => item instanceof type)) {
            return false;
        }
    }

    if (Array.isArray(allowedValues)) {
        if (!value.every(item => allowedValues.includes(item))) {
            return false;
        }
    }

    if (typeof func === "function" && !func(value)) {
        return false;
    }

    return true;
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
    if (isFunction(value)) {
        return value(params);
    }

    return undefined;
}
