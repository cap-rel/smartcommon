export * from "./SearchBar";


// const useVariantToPropstest = (componentKey, props) => {
//     const { states, set } = useStates({
//         params: {}
//     })

//     const { params } = states; 

//     const setParams = (newParams) => set("params", newParams);

//     const { ignoreTheme, variant } = props; 

//     const currentVariant = ignoreTheme ? toArray(variant) : [...useThemes(componentKey), ...toArray(variant)];

//     let variantProps = {};

//     const merge = (variantItem) => {
//         let mergedProps = {};
//         const currentProps = (isString(variantItem) ? (useVariants(componentKey)?.[variantItem] ?? {}) : variantItem) ?? {};
//         const currentPropsCopy = { ...currentProps };        

//         // const componentPropsEntries = Object.entries(currentPropsCopy).filter(([propKey, prop]) => !propKey.endsWith("Props") && !basePropsKeys.includes(propKey))
//         // const componentProps = Object.fromEntries(componentPropsEntries);
//         // for (const [key] of componentPropsEntries) {
//         //     delete currentPropsCopy[key];
//         // }    

//         Object.entries({ ...currentPropsCopy }).forEach(([propKey, prop]) => {
//             const mergedProp = prop;
//             if (propKey.endsWith("Props")) {
//                 // let lastVariant = variantProps[propKey].variant ?? [];
//                 // let currentVariant = mergedProp.variant ?? [];
                
//                 // if (!isArray(lastVariant)) {
//                 //     lastVariant = [lastVariant];
//                 // }

//                 // if (!isArray(currentVariant)) {
//                 //     currentVariant = [currentVariant];
//                 // }

//                 // mergedProp.variant = [...lastVariant, ...currentVariant];
//                 const variantProp = variantProps?.[propKey] ?? {};
//                 const lastStyle = variantProp?.style ?? {};
//                 const currentStyle = mergedProp?.style ?? {};
//                 mergedProp.style = { ...lastStyle, ...verifyFunction(currentStyle, params) };

//                 const lastClassName = variantProp?.className ?? "";
//                 const currentClassName = mergedProp?.className ?? "";
//                 mergedProp.className = twMerge(lastClassName, verifyFunction(currentClassName, params));

            
//                 mergedProps = { ...mergedProps, [propKey]: { ...variantProp, ...mergedProp } };
//             } else {
//                 mergedProps = { ...mergedProps, [propKey]: mergedProp };
//             }

//         });

//         variantProps = { ...variantProps, ...mergedProps };
//     };    

//     if (!isNil(currentVariant)) {
//         if (isArray(currentVariant)) {
//             currentVariant.forEach(variantItem => merge(variantItem));
//         } else {
//             merge(currentVariant);
//         }
//     }

//     merge(props);

//     const style = (keyProps, defaultStyle = "") => {
//         const variantStyle = variantProps[keyProps]?.style ?? {}; 
//         const style = { ...defaultStyle, ...variantStyle };
//         return { style };
//     };

//     const className = (keyProps, defaultClassName = {}) => {
//         const variantClassName = variantProps[keyProps]?.className ?? ""; 
//         const className = twMerge(defaultClassName, variantClassName);
//         return { className };
//     };

//     const mergeProps = (keyProps, defaultStyle = {}, defaultClassName = "") => {
//         const propsStyle = style(keyProps, defaultStyle);
//         const propsClassName = className(keyProps, defaultClassName);
//         const props = variantProps[keyProps] ?? {};
//         return { ...props, style: propsStyle.style, className: propsClassName.className };
//     }

//     // const mergeVariant = (defaultVariant, keyProps = null) => {
        
//     // };

//     return { variantProps, style, className, mergeProps, setParams };
// }