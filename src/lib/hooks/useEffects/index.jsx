import { useEffect } from "react";
import { constant, forEach, isFunction, mapValues, toArray, toString } from "lodash";

import { useStates } from "lib/hooks";
import { log } from "lib/utils";

export const useEffects = (effects) => {
    const { states, set } = useStates(mapValues(effects, constant(0)));

    forEach(effects, ({ deps, effect = () => {} }, key) => {
        if (isFunction(effect)) {
            deps = toArray(deps);

            useEffect(() => {
                log.effect(`(${states[key]}) ${key} [${toString(deps)}]`);
                set(key, states[key] + 1);
                effect();
            }, deps);
        }
    });
};