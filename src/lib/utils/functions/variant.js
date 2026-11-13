// The library twMerge knows the app-* spacing and radius tokens.
import { twMerge } from "./tailwindMerge";
import { isFunction } from "lodash";

export function resolveProp(prop, params = {}){
    return isFunction(prop) ? prop(params) : prop;
}

// export function mergeClassName(elementClassName = "", elementProps, defaultVariants, variant, elementKey, params = {}) {
//     let variantClassName = "";

//     const mergeVariant = (variantItem) => {
//         // const currentVariant = isString(variantItem) ? defaultVariants[variantItem][elementKey] : variantItem[elementKey];
//         const currentVariant = variantItem[elementKey];
//         variantClassName = twMerge(variantClassName, resolveProp(currentVariant?.className, params));
//     }

//     if (!isNil(variant)) {
//         if (isArray(variant)) {
//             variant.forEach(variantItem => mergeVariant(variantItem));
//         } else {
//             mergeVariant(variant);
//         }
//     }

//     const propsClassName = resolveProp(elementProps?.className, params);

//     const className = twMerge(elementClassName, twMerge(variantClassName, propsClassName));

//     return className;
// }

// export function mergeStyle(elementStyle, elementProps, defaultVariants, variant, elementKey, params = {}) {
//     let variantStyle = {};

//     const mergeVariant = (variantItem) => {
//         // const currentVariant = isString(variantItem) ? defaultVariants[variantItem][elementKey] : variantItem[elementKey];
//         const currentVariant = variantItem[elementKey];
//         variantStyle = { ...variantStyle, ...resolveProp(currentVariant?.style, params) };
//     }

//     if (!isNil(variant)) {
//         if (isArray(variant)) {
//             variant.forEach(variantItem => mergeVariant(variantItem));
//         } else {
//             mergeVariant(variant);
//         }
//     }

//     const propsStyle = resolveProp(elementProps?.style, params);

//     const style = { ...elementStyle, ...variantStyle, ...propsStyle };

//     return style;
// }

export function mergeClassName(props, defaultClassName = "") {
    const className = twMerge(defaultClassName, props?.className);
    return { className };
}

export function mergeStyle(props, defaultStyle = {}) {
    const style = { ...defaultStyle, ...props?.style };
    return { style };
}

// export function mergeProps(elementStyle, elementClassName, elementProps, defaultVariants, variant, elementKey, params = {}) {
//     let variantStyle = {};
//     let variantClassName = "";

//     const mergeVariant = (variantItem) => {
//         const currentVariant = isString(variantItem) ? (!isNil(defaultVariants[variantItem]) ? defaultVariants[variantItem][elementKey] : {}) : variantItem[elementKey];
//         // const currentVariant = variantItem[elementKey];

//         variantStyle = { ...variantStyle, ...resolveProp(currentVariant?.style, params) };
//         variantClassName = twMerge(variantClassName, resolveProp(currentVariant?.className, params));
//     }

//     if (!isNil(variant)) {
//         if (isArray(variant)) {
//             variant.forEach(variantItem => mergeVariant(variantItem));
//         } else {
//             mergeVariant(variant);
//         }
//     }
    
//     const propsStyle = resolveProp(elementProps?.style, params);
//     // const propsClassName = resolveProp(convertClassName(elementProps?.className, params), params);
//     const propsClassName = resolveProp(elementProps?.className, params);

//     const style = { ...elementStyle, ...variantStyle, ...propsStyle };
//     const className = twMerge(elementClassName, twMerge(variantClassName, propsClassName));

//     return { ...elementProps, style, className };
// }

// Pulls the var(...) references out of a CSS value: returns their contents
// and the value without them.
export function convertCSSVar(css) {
    const vars = [];
    const newStr = css.replace(/var\((.*?)\)/g, (match, content) => {
        vars.push(content);
        return "";
    });

    return { vars, newStr };
}

export const convertClassName = (className, params) => {
    return new Function(...Object.keys(params), `return \`${className}\`;`)(...Object.values(params));
};

export function getVariable(key) {
    return getComputedStyle(document.documentElement).getPropertyValue(key);
}

export function setVariable(key, value) {
    return document.documentElement.style.setProperty(key, value);
}

export function setGlobalVariables(id, variables) {
    for (const variable in variables) {
        const idVariable = `--${id}-${variable.slice(2)}`
        setVariable(idVariable, variables[variable]);
    }
}