import { isNil, isUndefined, isFunction, isObject } from "lib/utils";

// Add type and content

export function apiMap(schema, data, strict = false) {
    if (strict) {
        return Object.fromEntries(
            Object.entries(schema)
                .map(([key, { key: newKey, transform }]) => {
                    const value = data[key];

                    if (!newKey || isUndefined(value)) {
                        return null;
                    }

                    const newValue =
                        isNil(transform)
                            ? value
                            : isFunction(transform)
                                ? transform(value)
                                : transform;

                    return [newKey, newValue];
                })
                .filter(Boolean)
        );
    }

    return Object.fromEntries(
        Object.entries(data)
            .map(([key, value]) => {
                let newKey = key;
                let newValue = value;

                const propSchema = schema[key];

                if (propSchema && isObject(propSchema) && !isUndefined(newValue)) {
                    const { key: propKey, transform } = propSchema;

                    if (propKey) {
                        newKey = propKey;
                    }
                    
                    if (transform) {
                        newValue = isFunction(transform) ? transform(value) : transform;
                    }
                }

                return [newKey, newValue];
            })
    );
}