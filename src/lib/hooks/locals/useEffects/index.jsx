import { useEffect, useRef } from "react";
import { constant, forEach, isFunction, isPlainObject, mapValues, toArray } from "lodash";

import { log } from "lib/utils";

export const useEffects = (effects) => {
    if (!isPlainObject(effects)) {
        throw new Error("effects must be a plain object.");
    }

    const activationsRef = useRef(mapValues(effects, constant(1)));

    forEach(effects, ({ deps, effect = () => {}, debug = false }, key) => {
        if (isFunction(effect)) {
            deps = toArray(deps);

            let activation = activationsRef.current[key];

            useEffect(() => {
                if (debug) {
                    log.effect(`${key} (${activation}})`);
                }

                activation += 1
                effect();
            }, deps);
        }
    });

    return { activations: activationsRef.current };
};