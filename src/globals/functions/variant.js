import { twMerge } from "tailwind-merge";
import { isArray, isFunction, isNil, isString } from "./type";

export function resolveProp(prop, params = {}){
    return isFunction(prop) ? prop(params) : prop;
}

export function mergeClassName(elementClassName = "", elementProps, defaultVariants, variant, elementKey, params = {}) {
    let variantClassName = "";

    const mergeVariant = (variantItem) => {
        // const currentVariant = isString(variantItem) ? defaultVariants[variantItem][elementKey] : variantItem[elementKey];
        const currentVariant = variantItem[elementKey];
        variantClassName = twMerge(variantClassName, resolveProp(currentVariant?.className, params));
    }

    if (!isNil(variant)) {
        if (isArray(variant)) {
            variant.forEach(variantItem => mergeVariant(variantItem));
        } else {
            mergeVariant(variant);
        }
    }

    const propsClassName = resolveProp(elementProps?.className, params);

    const className = twMerge(elementClassName, twMerge(variantClassName, propsClassName));

    return className;
}

export function mergeStyle(elementStyle, elementProps, defaultVariants, variant, elementKey, params = {}) {
    let variantStyle = {};

    const mergeVariant = (variantItem) => {
        // const currentVariant = isString(variantItem) ? defaultVariants[variantItem][elementKey] : variantItem[elementKey];
        const currentVariant = variantItem[elementKey];
        variantStyle = { ...variantStyle, ...resolveProp(currentVariant?.style, params) };
    }

    if (!isNil(variant)) {
        if (isArray(variant)) {
            variant.forEach(variantItem => mergeVariant(variantItem));
        } else {
            mergeVariant(variant);
        }
    }

    const propsStyle = resolveProp(elementProps?.style, params);

    const style = { ...elementStyle, ...variantStyle, ...propsStyle };

    return style;
}

export function mergeProps(elementStyle, elementClassName, elementProps, defaultVariants, variant, elementKey, params = {}) {
    let variantStyle = {};
    let variantClassName = "";

    const mergeVariant = (variantItem) => {
        const currentVariant = isString(variantItem) ? (!isNil(defaultVariants[variantItem]) ? defaultVariants[variantItem][elementKey] : {}) : variantItem[elementKey];
        // const currentVariant = variantItem[elementKey];

        variantStyle = { ...variantStyle, ...resolveProp(currentVariant?.style, params) };
        variantClassName = twMerge(variantClassName, resolveProp(currentVariant?.className, params));
    }

    if (!isNil(variant)) {
        if (isArray(variant)) {
            variant.forEach(variantItem => mergeVariant(variantItem));
        } else {
            mergeVariant(variant);
        }
    }
    
    const propsStyle = resolveProp(elementProps?.style, params);
    const propsClassName = resolveProp(elementProps?.className, params);

    const style = { ...elementStyle, ...variantStyle, ...propsStyle };
    const className = twMerge(elementClassName, twMerge(variantClassName, propsClassName));

    return { ...elementProps, style, className };
}

export function convertCSSVar(css) {     
    const test = "var(sdfsdfsf var(fsdfsdfsf)";
    return test.indexOf("var(");
}