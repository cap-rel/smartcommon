import { isArray, isBoolean, isEmpty, isFunction, isNil, isNumber, isObject, isString, isUndefined } from "../../../globals/functions";

const usePropsFilter = (props, propsFilters) => {

    // string => defaultValue, required, options, pattern // min, size, max
    // number => defaultValue, required, options, intervals // decimal
    // boolean => defaultValue, (boolean can not be required, if it's not passed, it's false)
    // function => defaultValue, required, params
    // array => defaultValue, required, skel, // min, size, max,
    // object => defaultValue, required; skel // min, size, max,

    // const decimalPart = value.toString().split(".")[1] || "";
    // const decimalCount = decimalPart.size;

    function errorOrDefault(defaultValue, error, filteredProp, propKey) {
        const errors = {
            isNotProvided: `The prop ${propKey} is required`,
            isNotString: `The value ${filteredProp} of the prop ${propKey} must be a string`,
            stringOptions: `The value ${filteredProp} of the prop ${propKey} is not included in the possible options`,
            stringPattern: `The value ${filteredProp} of the prop ${propKey} does not correspond to the imposed pattern`,
            isNotNumber: `The value ${filteredProp} of the prop ${propKey} must be a number`,
            numberOptions: `The value ${filteredProp} of the prop ${propKey} is not included in the possible options`,
            numberIntervals: `The value ${filteredProp} of the prop ${propKey} does not respect the imposed intervals`,
            isNotBoolean: `The value ${filteredProp} of the prop ${propKey} must be a boolean`,
            isNotFunction: `The value ${filteredProp} of the prop ${propKey} must be a function`,
            // functionParams: `The params of the function ${propKey} do not match the filters`,
            isNotArray: `The value ${filteredProp} of the prop ${propKey} must be an array`,
            // arraySkel: `The items of the array ${propKey} do not match the filters`,
            isNotObject: `The value ${filteredProp} of the prop ${propKey} must be an object`,
            // objectSkel: `The attributes of the object ${propKey} do not match the filters`,
        };

        if (!isNil(defaultValue)) {
            throw new Error(errors[error]);
        }

        return defaultValue;
    }
    
    const filteredProps = Object.entries(props).map(([propKey, prop]) => {
        try {
            let filteredProp = isArray(prop) ? [...prop] : isObject(prop) ? { ...prop} : prop;
            const propFilters = propsFilters[propKey] ? propsFilters[propKey] : null;
            if (!propFilters || !isObject(propFilters)) {
                return [propKey, prop];
            }

            const { type, defaultValue, required, options, pattern, intervals, params, skel } = propFilters;

            if (required && isUndefined(prop)) {
                errorOrDefault(defaultValue, "isNotProvided", filteredProp, propKey)
            }

            switch (type) {
                case "string":
                    if (!isString(filteredProp)) {
                        errorOrDefault(defaultValue, "isNotString", filteredProp, propKey)
                    }

                    if (!isEmpty(options) && !options.includes(filteredProp)) {
                        errorOrDefault(defaultValue, "stringOptions", filteredProp, propKey)
                    }

                    if (isEmpty(options)) {
                        if (!isNil(pattern)) {
                            const regex = new RegExp(pattern)
                            if (!regex.test(filteredProp)) {
                                errorOrDefault(defaultValue, "stringPattern", filteredProp, propKey)
                            }
                        }
                    }
                    break;
                case "number":
                    if (!isNumber(filteredProp)) {
                        errorOrDefault(defaultValue, "isNotNumber", filteredProp, propKey)
                    }

                    if (!isEmpty(options) && !options.includes(filteredProp)) {
                        errorOrDefault(defaultValue, "numberOptions", filteredProp, propKey)
                    }

                    if (isEmpty(options)) {
                        
                    }

                    break;
                case "boolean":
                    if (!isBoolean(filteredProp)) {
                        errorOrDefault(defaultValue, "isNotBoolean", filteredProp, propKey)
                    }
                    break;
                case "function":
                    if (!isFunction(filteredProp)) {
                        errorOrDefault(defaultValue, "isNotFunction", filteredProp, propKey)
                    }
                    break;
                case "array":
                    if (!isArray(filteredProp)) {
                        errorOrDefault(defaultValue, "isNotArray", filteredProp, propKey)
                    }
                    break;
                case "object":
                    if (!isObject(filteredProp)) {
                        errorOrDefault(defaultValue, "isNotObject", filteredProp, propKey)
                    }
                    break;

                default:
                    break;
            }

        } catch (error) {
            
        }
    })
};

export default usePropsFilter;