import { isArray, isFunction, isNil, isObject, isString, isUndefined, toArray, twMerge } from "../../utils";
import { useStates } from "../useStates";
import { useLib } from "../../hooks";

function verifyFunction(func, params = {}){
    return isFunction(func) ? func(params) : func;
}

// basePropsKeys = []

export const useVariantMerger = (componentKey, props) => {
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

    // const { theme, themes, variants } = useLib() ?? {}; // TODO

    // if (isNil(themes)) {
    //     throw new Error("No themes provided");
    // }

    // const themeVariant = themes?.[theme]?.[componentKey];

    // const themeVariantArray = isNil(themeVariant) ? [] : toArray(themeVariant);

    // if (isNil(variants)) {
    //   throw new Error("No variants provided");
    // }

    // ...themeVariantArray,
    
    const variants = {
        button: {
            outlined: {
                buttonProps: {
                    className: "text-gray-800 bg-white border"
                },
            },
            uppercase: {
                labelProps: {
                    className: "uppercase"
                }
            }
        }
    };

    const variant = [...toArray(props.variant)].map(variant => {
        if (isString(variant)) {
            return variants[componentKey]?.[variant] || {};
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

    const mergeQuickProps = (props, quickPropsKeys = []) => {
        return Object.fromEntries(quickPropsKeys.map(key => {

            const quickProp = isArray(key) ? variantProps[key[0]] : variantProps[key];
            const defaultProp = isArray(key) ? key[1] : undefined;
            const currentKey = isArray(key) ? key[0] : key;

            return [currentKey, quickProp ?? defaultProp]
        }))
    };
    
    return { variantProps, mergeProps, mergeQuickProps, setParams };
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