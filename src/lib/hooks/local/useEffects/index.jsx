import { useEffect, useRef } from "react";
import { constant, forEach, isFunction, isPlainObject, mapValues, toArray } from "lodash";

import { log, throwTypeError } from "lib/utils";

// export const useEffects = (effects) => {
//     if (!isPlainObject(effects)) {
//         throw new Error("effects must be a plain object.");
//     }

//     const activationsRef = useRef(mapValues(effects, constant(1)));

//     forEach(effects, ({ deps, effect = () => {}, debug = false }, key) => {
//         if (isFunction(effect)) {
//             deps = toArray(deps);

//             let activation = activationsRef.current[key];

//             useEffect(() => {
//                 if (debug) {
//                     log.effect(`${key} (${activation}})`);
//                 }

//                 activation += 1
//                 effect();
//             }, deps);
//         }
//     });

//     return { activations: activationsRef.current };
// };

export const useEffect = (props = {}) => {
    throwTypeError({ value: props, name: "props", type: ["plain object"] });

    const { deps, fn = () => {}, debug } = props;

    throwTypeError({ value: fn, name: "fn", type: ["plain object"] });

    const depsArray = toArray(deps);

    useEffect(() => {
        if (debug) {
            log.effect(`${key} (${activation}})`);
        }

        fn();
    }, depsArray);
};