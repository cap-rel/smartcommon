import { useEffect } from "react";
import { constant, forEach, isFunction, mapValues, reduce, toArray, toString } from "lodash";

import { useStates } from "lib/hooks";
import { log } from "lib/utils";

export const useEffects = (effects) => {
    const initialStates = mapValues(effects, constant(1));
    const { states, set } = useStates({ initialStates, debug: false });

    forEach(effects, ({ deps, effect = () => {} }, key) => {
        if (isFunction(effect)) {
            deps = toArray(deps);

            useEffect(() => {
                log.effect(`${key} (${states[key]})`);
                set(key, states[key] + 1);
                effect();
            }, deps);
        }
    });

    return { states };
};