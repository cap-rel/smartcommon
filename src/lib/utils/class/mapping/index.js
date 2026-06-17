import { filter, find, fromPairs, has, isArray, isFunction, isPlainObject, isUndefined, toPairs } from "lodash";

import { throwTypeError } from "lib/utils";

// Declarative coercion used by the `type` shorthand. Mirrors the hand-written
// toInt/toFloat/toStr helpers that consumer apps used to repeat per field.
// `int`/`float`/`number` are aliases (Number() based, no truncation), matching
// the historical toInt/toFloat behaviour. Invalid numbers fall back to the
// field `default` (or 0); null/undefined strings fall back to `default` (or "").
const coerce = (value, type, fallback) => {
    switch (type) {
        case "int":
        case "float":
        case "number": {
            const n = Number(value);
            return Number.isFinite(n) ? n : (isUndefined(fallback) ? 0 : fallback);
        }
        case "string":
            return (value === undefined || value === null) ? (isUndefined(fallback) ? "" : fallback) : String(value);
        case "bool":
        case "boolean":
            // Dolibarr-aware: "0", "false", "" and the usual falsy values are
            // false. Plain Boolean() would make Boolean("0") === true.
            return value !== false && value !== 0 && value !== null && value !== undefined
                && value !== "" && value !== "0" && value !== "false";
        default:
            return value;
    }
};

const coercedDefault = (propSchema) => (
    has(propSchema, "default")
        ? (isUndefined(propSchema.type) ? propSchema.default : coerce(propSchema.default, propSchema.type))
        : undefined
);

// Apply the READ-direction transform (nested schema / array items / from / type).
const applyMapTransform = (value, propSchema, strict) => {
    const { from, schema: nestedSchema, items, type } = propSchema;

    if (!isUndefined(nestedSchema) && isPlainObject(value)) {
        return new Mapping({ schema: nestedSchema, strict }).map(value);
    }
    if (!isUndefined(items)) {
        // A non-array collapses to [] ; non-object entries are dropped. Matches
        // the historical `Array.isArray(x) ? x.map(fn).filter(Boolean) : []`.
        const itemMapping = new Mapping({ schema: items, strict });
        return isArray(value) ? value.filter(isPlainObject).map((entry) => itemMapping.map(entry)) : [];
    }
    if (!isUndefined(from)) {
        return isFunction(from) ? from(value) : from;
    }
    if (!isUndefined(type)) {
        return coerce(value, type, propSchema.default);
    }
    return value;
};

// Apply the WRITE-direction transform (nested schema / array items / to / type).
const applyReverseTransform = (value, propSchema, strict) => {
    const { to, schema: nestedSchema, items, type } = propSchema;

    if (!isUndefined(nestedSchema) && isPlainObject(value)) {
        return new Mapping({ schema: nestedSchema, strict }).reverse(value);
    }
    if (!isUndefined(items)) {
        const itemMapping = new Mapping({ schema: items, strict });
        return isArray(value) ? value.filter(isPlainObject).map((entry) => itemMapping.reverse(entry)) : [];
    }
    if (!isUndefined(to)) {
        return isFunction(to) ? to(value) : to;
    }
    if (!isUndefined(type)) {
        return coerce(value, type, propSchema.default);
    }
    return value;
};

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

        // First pass over the payload's OWN keys. We iterate Object.keys (not
        // lodash map) so an object carrying a numeric `length` property is not
        // mistaken for an array-like and iterated by index (data-loss bug).
        const entries = Object.keys(data).map((key) => {
            const value = data[key];
            const propSchema = this.schema[key];

            if (isUndefined(propSchema)) {
                return this.strict ? null : [key, value];
            }

            if (!isUndefined(value)) {
                throwTypeError({ value: propSchema, name: "Mapping schemas", type: ["plain object"] });

                const { key: propKey } = propSchema;
                let outKey = key;

                if (!isUndefined(propKey)) {
                    throwTypeError({ value: propKey, name: "key", type: ["string"] });
                    outKey = propKey;
                }

                return [outKey, applyMapTransform(value, propSchema, this.strict)];
            }

            return [key, value];
        });

        const result = fromPairs(filter(entries, Boolean));

        // Second pass: multi-source aliases + completeness defaults.
        // No-op for legacy schemas (no `aliases` / no `default`).
        const aliasSourceKeys = new Set();
        const frontKeys = new Set();
        toPairs(this.schema).forEach(([serverKey, propSchema]) => {
            if (isPlainObject(propSchema)) {
                frontKeys.add(isUndefined(propSchema.key) ? serverKey : propSchema.key);
            }
        });

        toPairs(this.schema).forEach(([serverKey, propSchema]) => {
            if (!isPlainObject(propSchema)) {
                return;
            }

            const frontKey = isUndefined(propSchema.key) ? serverKey : propSchema.key;

            // Multi-source: the canonical value may live under the primary key
            // OR any alias. Take the first that is neither undefined nor null
            // (Dolibarr returns null for empty FKs). Authoritative for alias
            // fields and overrides whatever the first pass produced.
            if (isArray(propSchema.aliases)) {
                propSchema.aliases.forEach((a) => aliasSourceKeys.add(a));

                const sourceKeys = [serverKey, ...propSchema.aliases];
                const hitKey = find(sourceKeys, (k) => !isUndefined(data[k]) && data[k] !== null);

                if (!isUndefined(hitKey)) {
                    result[frontKey] = applyMapTransform(data[hitKey], propSchema, this.strict);
                } else if (has(propSchema, "default")) {
                    result[frontKey] = coercedDefault(propSchema);
                }
                return;
            }

            // Non-alias: only fill when the front key is missing (completeness).
            if (has(result, frontKey) && !isUndefined(result[frontKey])) {
                return;
            }
            if (has(propSchema, "default")) {
                result[frontKey] = coercedDefault(propSchema);
            }
        });

        // Strip raw alias source keys that leaked through the loose first pass
        // (unless a key is also a legitimate front output key).
        aliasSourceKeys.forEach((key) => {
            if (!frontKeys.has(key) && has(result, key)) {
                delete result[key];
            }
        });

        return result;
    }

    reverse(data) {
        if (!isPlainObject(data)) {
            return data;
        }

        // First pass over the front object's OWN keys (Object.keys, length-safe).
        // Fields declaring `writeFrom` are skipped here and resolved by the
        // authoritative second pass (so a null primary cannot block the fallback).
        const entries = Object.keys(data).map((key) => {
            const value = data[key];
            const entry = find(toPairs(this.schema), ([propKey, propSchema]) => (isPlainObject(propSchema) && propSchema.key) ? propSchema.key === key : propKey === key);

            if (isUndefined(entry)) {
                return this.strict ? null : [key, value];
            }

            const [propKey, propSchema] = entry;

            // Read-only fields are server-owned/computed: never write them back.
            if (propSchema.readOnly || isArray(propSchema.writeFrom)) {
                return null;
            }

            // omitEmpty: write the field only when it carries a real value.
            // Reproduces the legacy `if (x !== undefined && x !== null && x !== "")`
            // gate (e.g. stock datem/type_mouvement, conditional lines arrays).
            if (propSchema.omitEmpty && (isUndefined(value) || value === null || value === "")) {
                return null;
            }

            if (!isUndefined(value)) {
                throwTypeError({ value: propSchema, name: "Mapping schemas", type: ["plain object"] });
                return [propKey, applyReverseTransform(value, propSchema, this.strict)];
            }

            return [propKey, value];
        });

        const result = fromPairs(filter(entries, Boolean));

        // Second pass: write-side front-key fallback (writeFrom) + completeness
        // defaults. The old hand-written mapToBackend always returned a complete,
        // defaulted payload; this restores that contract. Skips read-only.
        toPairs(this.schema).forEach(([serverKey, propSchema]) => {
            // omitEmpty fields are never backfilled with a default on write.
            if (!isPlainObject(propSchema) || propSchema.readOnly || propSchema.omitEmpty) {
                return;
            }
            if (has(result, serverKey) && !isUndefined(result[serverKey])) {
                return;
            }

            const frontKey = isUndefined(propSchema.key) ? serverKey : propSchema.key;
            const frontSources = isArray(propSchema.writeFrom) ? [frontKey, ...propSchema.writeFrom] : [frontKey];
            const hit = find(frontSources, (fk) => !isUndefined(data[fk]) && data[fk] !== null);

            if (!isUndefined(hit)) {
                result[serverKey] = applyReverseTransform(data[hit], propSchema, this.strict);
            } else if (has(propSchema, "default")) {
                result[serverKey] = coercedDefault(propSchema);
            }
        });

        // Third pass: fan a single front field out to extra server keys.
        toPairs(this.schema).forEach(([serverKey, propSchema]) => {
            if (!isPlainObject(propSchema) || propSchema.readOnly || !isArray(propSchema.alsoWrite)) {
                return;
            }
            if (!has(result, serverKey)) {
                return;
            }
            propSchema.alsoWrite.forEach((extraKey) => {
                if (!has(result, extraKey)) {
                    result[extraKey] = result[serverKey];
                }
            });
        });

        return result;
    }
}
