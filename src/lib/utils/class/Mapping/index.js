import { filter, find, fromPairs, has, isFunction, isPlainObject, isUndefined, map, toPairs } from "lodash";

import { throwTypeError } from "lib/utils";

export class Mapping {
    constructor(props = {}) {
        throwTypeError({ value: props, name: "props", type: ["plain object"] });

        const { schema = {}, strict = false } = props;

        throwTypeError({ value: schema, name: "schema", type: ["plain object"] });

        this.schema = schema;
        this.strict = strict;
    }

    map(data) {
        if (!isPlainObject(data)) {
            return data;
        }

        const entries = map(data, (value, key) => {
            const propSchema = this.schema[key];

            if (isUndefined(propSchema)) {
                return this.strict ? null : [key, value];
            }

            
            if (!isUndefined(value)) {
                throwTypeError({ value: propSchema, name: "Mapping schemas", type: ["plain object"] });

                const { key: propKey, transform, schema: nestedSchema } = propSchema;

                if (!isUndefined(propKey)) {
                    throwTypeError({ value: propKey, name: "key", type: ["string"] });

                    key = propKey;
                }

                if (!isUndefined(nestedSchema) && isPlainObject(value)) {
                    throwTypeError({ value: nestedSchema, name: "Mapping schemas", type: ["plain object"] });

                    const nestedMapping = new Mapping({ schema: nestedSchema, strict: this.strict });

                    value = nestedMapping.map(value);
                } else if (!isUndefined(transform)) {
                    value = isFunction(transform) ? transform(value) : transform;
                }
            }

            return [key, value];
        });

        return fromPairs(filter(entries, Boolean));
    }

    reverse(data) {
        if (!isPlainObject(data)) {
            return data;
        }

        const entries = map(data, (value, key) => {
            const entry = find(toPairs(this.schema), ([propKey, propSchema]) => propSchema?.key ? propSchema?.key === key : propKey === key);

            if (isUndefined(entry)) {
                return this.strict ? null : [key, value];
            }

            const [propKey, propSchema] = entry;
            
            if (!isUndefined(value)) {
                throwTypeError({ value: propSchema, name: "Mapping schemas", type: ["plain object"] });

                const { schema: nestedSchema } = propSchema;

                key = propKey;

                if (!isUndefined(nestedSchema) && isPlainObject(value)) {
                    throwTypeError({ value: nestedSchema, name: "Mapping schemas", type: ["plain object"] });

                    const nestedMapping = new Mapping({ schema: nestedSchema, strict: this.strict });

                    value = nestedMapping.reverse(value);
                }
            }

            return [key, value];
        });

        return fromPairs(filter(entries, Boolean));
    }
}