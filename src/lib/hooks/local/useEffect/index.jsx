import { useEffect as useReactEffect, useRef } from "react";
import { constant, forEach, isArray, isFunction, isPlainObject, isUndefined, mapValues, toArray, upperFirst } from "lodash";

import { log, throwTypeError } from "lib/utils";
import { useLibConfig } from "lib/hooks";

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

    const { on, deps = [], fn = () => {} } = props;

    const libConfig = useLibConfig();

    const debug = isUndefined(props.debug) ? libConfig.debug : props.debug;

    throwTypeError({ value: deps, name: "deps", type: ["array"] });
    throwTypeError({ value: fn, name: "fn", type: ["function"] });

    // Run counter, used by the debug log only. It is deliberately NOT returned:
    // a ref read during render is not reactive, so the caller received the count
    // of whatever render happened to run last rather than the current one.
    const activationsRef = useRef(1);

    useReactEffect(() => {
        if (debug) {
            log.effect(`${on ? `on${upperFirst(on)}` : undefined} (${activationsRef.current})`);
        }

        activationsRef.current += 1;
        fn();
    }, deps);
};