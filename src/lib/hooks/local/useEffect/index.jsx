import { useEffect as useReactEffect, useRef } from "react";
import { constant, forEach, isArray, isFunction, isPlainObject, mapValues, toArray, upperFirst } from "lodash";

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

    const { on, deps = [], fn = () => {}, debug } = props;

    throwTypeError({ value: deps, name: "deps", type: ["array"] });
    throwTypeError({ value: fn, name: "fn", type: ["function"] });

    const activationsRef = useRef(1);

    useReactEffect(() => {
        if (debug) {
            log.effect(`${on ? `on${upperFirst(on)}` : undefined} (${activationsRef.current})`);
        }

        activationsRef.current += 1;
        fn();
    }, deps);

    return {
        activations: activationsRef.current
    }
};