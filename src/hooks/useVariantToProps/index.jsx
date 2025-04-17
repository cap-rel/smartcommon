import { isArray, isFunction, isNil, isObject, isString, isUndefined, toArray, twMerge } from "../../globals";
import { useStates } from "../useStates";
import { useEffect } from "react";
import { useVariants } from "../useVariants";
import { useThemes } from "../useThemes";

function verifyFunction(func, params = {}){
    return isFunction(func) ? func(params) : func;
}

// basePropsKeys = []

const useVariantToPropstest = (componentKey, props) => {
    const { states, set } = useStates({
        params: {}
    })

    const { params } = states; 

    const setParams = (newParams) => set("params", newParams);

    const { ignoreTheme, variant } = props; 

    const currentVariant = ignoreTheme ? toArray(variant) : [...useThemes(componentKey), ...toArray(variant)];

    let variantProps = {};

    const merge = (variantItem) => {
        let mergedProps = {};
        const currentProps = (isString(variantItem) ? (useVariants(componentKey)?.[variantItem] ?? {}) : variantItem) ?? {};
        const currentPropsCopy = { ...currentProps };        

        // const componentPropsEntries = Object.entries(currentPropsCopy).filter(([propKey, prop]) => !propKey.endsWith("Props") && !basePropsKeys.includes(propKey))
        // const componentProps = Object.fromEntries(componentPropsEntries);
        // for (const [key] of componentPropsEntries) {
        //     delete currentPropsCopy[key];
        // }    

        Object.entries({ ...currentPropsCopy }).forEach(([propKey, prop]) => {
            const mergedProp = prop;
            if (propKey.endsWith("Props")) {
                // let lastVariant = variantProps[propKey].variant ?? [];
                // let currentVariant = mergedProp.variant ?? [];
                
                // if (!isArray(lastVariant)) {
                //     lastVariant = [lastVariant];
                // }

                // if (!isArray(currentVariant)) {
                //     currentVariant = [currentVariant];
                // }

                // mergedProp.variant = [...lastVariant, ...currentVariant];
                const variantProp = variantProps?.[propKey] ?? {};
                const lastStyle = variantProp?.style ?? {};
                const currentStyle = mergedProp?.style ?? {};
                mergedProp.style = { ...lastStyle, ...verifyFunction(currentStyle, params) };

                const lastClassName = variantProp?.className ?? "";
                const currentClassName = mergedProp?.className ?? "";
                mergedProp.className = twMerge(lastClassName, verifyFunction(currentClassName, params));

            
                mergedProps = { ...mergedProps, [propKey]: { ...variantProp, ...mergedProp } };
            } else {
                mergedProps = { ...mergedProps, [propKey]: mergedProp };
            }

        });

        variantProps = { ...variantProps, ...mergedProps };
    };    

    if (!isNil(currentVariant)) {
        if (isArray(currentVariant)) {
            currentVariant.forEach(variantItem => merge(variantItem));
        } else {
            merge(currentVariant);
        }
    }

    merge(props);

    const style = (keyProps, defaultStyle = "") => {
        const variantStyle = variantProps[keyProps]?.style ?? {}; 
        const style = { ...defaultStyle, ...variantStyle };
        return { style };
    };

    const className = (keyProps, defaultClassName = {}) => {
        const variantClassName = variantProps[keyProps]?.className ?? ""; 
        const className = twMerge(defaultClassName, variantClassName);
        return { className };
    };

    const mergeProps = (keyProps, defaultStyle = {}, defaultClassName = "") => {
        const propsStyle = style(keyProps, defaultStyle);
        const propsClassName = className(keyProps, defaultClassName);
        const props = variantProps[keyProps] ?? {};
        return { ...props, style: propsStyle.style, className: propsClassName.className };
    }

    // const mergeVariant = (defaultVariant, keyProps = null) => {
        
    // };

    return { variantProps, style, className, mergeProps, setParams };
}

export const useVariantToProps = (componentKey, props) => {
    // ignoreGlobalTheme,
    // theme,
    // ignoreTheme ?
    // ignorePreviousVariant


    const { states, set } = useStates({
        params: {}
    })

    const { params } = states; 

    const setParams = (newParams) => set("params", newParams);

    const isComponent = (key) => /^[A-Z]/.test(key);
    
    const isElementProps = (key) => key.endsWith("Props");
    
    const mergeElementProps = (previousProps = {}, nextProps = {}) => {
        const mergedProps = { ...previousProps };
        
        for (const key in nextProps) {
            const previousProp = previousProps[key];
            const nextProp = nextProps[key];

            if (key === 'className') {
                mergedProps[key] = twMerge(previousProp, verifyFunction(nextProp, params));
            } else if (key === 'style') {
                mergedProps[key] = { ...(previousProp || {}), ...(verifyFunction(nextProp, params) || {}) };
            } else if (!isUndefined(nextProp)){
                mergedProps[key] = nextProp;
            }
        }
        
        return mergedProps;
    };
    
    const mergeVariant = (previousVariant = {}, nextVariant = {}) => {
        const mergedVariant = { ...previousVariant };
        
        for (const key in nextVariant) {
            const previousProp = previousVariant[key];
            const nextProp = nextVariant[key];
        
            if (isComponent(key)) {
                mergedVariant[key] = mergeVariant(previousProp, nextProp);
            } else if (isElementProps(key)) {
                mergedVariant[key] = mergeElementProps(previousProp, nextProp);
            } else if (!isUndefined(nextProp)) {
                mergedVariant[key] = nextProp;
            }
        }
        
        return mergedVariant;
    };

    const variant = [...useThemes(componentKey), ...toArray(props.variant)].map(variant => {
        if (isString(variant)) {
            return useVariants(componentKey)?.[variant] || {}
        } else {
            return variant || {};
        }
    });

    let variantProps = [...variant, props].reduce((acc, variant) => mergeVariant(acc, variant), {});

    const mergeDefaultElementProps = (defaultProps = {}, props = {}) => ({        
        ...defaultProps,
        style: { ...(defaultProps.style || {}), ...(props.style || {})},
        className: twMerge(defaultProps.className, props.className) 
    });

    const mergeDefaultComponent = (defaultProps = {}, props = {}) => {
        const mergedProps = { ...props, ...defaultProps };
      
        for (const key in defaultProps) {
          if (isComponent(key)) {
            mergedProps[key] = mergeDefaultComponent(defaultProps[key], props[key]);
          } else if (isElementProps(key)) {
            mergedProps[key] = mergeDefaultElementProps(defaultProps[key], props[key]);
          }
        }
      
        return mergedProps;
      };

    const mergeProps = (key, propsFunction) => {
        if (isComponent(key)) {
            const props = variantProps[key] || {};
            const mergedProps = { ...propsFunction(props)};

            return mergeDefaultComponent(mergedProps, props);
        } else {
            const props = variantProps[`${key}Props`] || {};
            const mergedProps = { ...propsFunction(props)};
    
            return mergeDefaultElementProps(mergedProps, props);
        }
    };
    
    return { variantProps, mergeProps, setParams };
};


// if (isComponent(key)) {
//     const props = variantProps[`${key}Props`] || {};
//     const mergedProps = propsFunction(props);
//     let test = { ...mergedProps};

//     for (const key in mergedProps) {
//         if (isComponent(key)) {

//         } else if (isElementProps(key)) {
//             test = { ...test, [key]: {

//             }}
//         } else if (!isUndefined(nextProp)) {

//         }
//     }

// } else {