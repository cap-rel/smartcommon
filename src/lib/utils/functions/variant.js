import { twMerge } from "tailwind-merge";

import { isFunction } from "lib/utils";

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

export function mergeProps() {

}

export function mergeClassName(props, defaultClassName = "") {
    const className = twMerge(defaultClassName, props?.className);
    return { className };
}

export function mergeStyle(props, defaultStyle = {}) {
    const style = { ...defaultStyle, ...props?.style };
    return { style };
}

export function mergePropsPlus(props, variants, variant) {
    // const currentVariant = isString(variant) ? (!isNil(variants[variant]) ? variants[variant][elementKey] : {}) : variant;
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

export function convertCSSVar(css) {     
    const string = "var(--color var(--font) fsdfsdf ) fdsfds var(  --size) var--image)";

    // function getAllIndexes(str, subStr) {
    //     let indexes = [];
    //     let index = str.indexOf(subStr);
        
    //     while (index !== -1) {
    //         indexes.push(index);
    //         index = str.indexOf(subStr, index + 1);
    //     }
        
    //     return indexes;
    // }

    // return getAllIndexes(test ,"var(");

    function extractVars(str) {
        let regex = /var\(([^)]+)\)/g;
        let vars = [];
        let match;
    
        while ((match = regex.exec(str)) !== null) {
            vars.push(match[1]); // Capture uniquement le contenu entre var(...)
        }
    
        return vars;
    }

    function extractAndRemoveVars(str) {
        let vars = [];
        let newStr = str.replace(/var\((.*?)\)/g, (match, content) => {
            vars.push(content); // On stocke le contenu de var() dans le tableau
            return ""; // On remplace par une chaîne vide pour supprimer l'occurrence
        });
    
        return { vars, newStr };
    }
    

    return extractAndRemoveVars(css);
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