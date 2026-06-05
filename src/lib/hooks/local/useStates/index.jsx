import { useState, useCallback, useRef } from "react";
import { isNil, isUndefined, isArray, isEqual } from "lodash";

import { log, throwTypeError } from "lib/utils";
import { useLibConfig } from "lib/hooks";

export const useStates = (props = {}) => {
  throwTypeError({ value: props, name: "useStates props", type: ["plain object"] })

  const { initialStates = {} } = props;

  const libConfig = useLibConfig();

  const debug = isUndefined(props.debug) ? libConfig.debug : props.debug;
  const debugRef = useRef(debug);
  debugRef.current = debug;

  throwTypeError({ value: initialStates, name: "initialStates", type: ["plain object"] })

  const [states, setStates] = useState(initialStates);
  const statesRef = useRef(states);
  statesRef.current = states;

  // ---------------------- parsePath (Parser) ----------------------

  const parsePath = useCallback((path) => {
    const parts = [];
    path.split(".").forEach(segment => {
      const regex = /([\w-]+)|\[(\d*)\]/g;
      let match;
      while ((match = regex.exec(segment)) !== null) {
        if (match[1]) {
          parts.push(match[1]);
        } else if (match[2] === "") {
          parts.push("__PUSH__"); // push automatique
        } else {
          parts.push(match[2]); // index numérique
        }
      }
    });
    return parts;
  }, []);

  // ---------------------- get ----------------------

  const get = useCallback((path) => {
    throwTypeError({ value: path, name: "get path", type: ["string"], required: true });

    let level = statesRef.current;

    if (!isNil(path)) {
      const parts = parsePath(path);

      for (const part of parts) {
        if (part === "__PUSH__" || level == null || !(part in level)) {
          return undefined;
        }

        level = level[part];
      }
    }

    return level;
  }, [parsePath]);

  // ---------------------- set ----------------------

  const set = useCallback((path, value) => {
    throwTypeError({ value: path, name: "set path", type: ["string"] });

    if (isUndefined(path)) {
      throwTypeError({ value: value, name: "When the path is nil, set value", type: ["object"] });

      // Short-circuit a redundant whole-state write so React bails the re-render.
      setStates((prevState) => (isEqual(prevState, value) ? prevState : value));
      return value;
    }

    setStates((prevState) => {

      const newState = structuredClone(prevState);
      const parts = parsePath(path);

      let level = newState;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const nextKey = parts[i + 1];
        const isNextPush = nextKey === "__PUSH__";

        // Remplace un scalaire par un objet ou tableau si nécessaire
        if (level[key] !== Object(level[key])) {
          level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
        }

        // Crée le niveau si absent
        if (!(key in level)) {
          level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
        }

        level = level[key];
      }

      const lastKey = parts[parts.length - 1];

      // Applique la valeur (fonction ou simple valeur)
      const applyValue = (target, keyOrIndex) => {
        const prevValue =
          keyOrIndex === "__PUSH__"
            ? target[target.length - 1]
            : target[keyOrIndex];
        const newValue = typeof value === "function" ? value(prevValue) : value;

        if (keyOrIndex === "__PUSH__") {
          target.push(newValue);
        } else {
          target[keyOrIndex] = newValue;
        }
      };

      if (lastKey === "__PUSH__") {
        if (!isArray(level)) {
          level = level instanceof Object ? level : [];
        }
        applyValue(level, "__PUSH__");
      } else {
        applyValue(level, lastKey);
      }

      if (debugRef.current) {
        log.state(`SET ${path} =>`, value);
      }

      // Short-circuit redundant writes: if the resulting state is deep-equal
      // to the previous one, return the SAME reference so React bails out of
      // the re-render. Without this, set("user", sameValue) mints a fresh state
      // reference on every call, which cascades into useApi recreating the
      // whole `api` object (user is in its memo deps) and any consumer running
      // useEffect([api]) that fetches + setState looping forever. Real changes
      // still produce a new reference and propagate normally.
      return isEqual(prevState, newState) ? prevState : newState;
    });
  }, [parsePath]);

  // ---------------------- unset ----------------------

  const unset = useCallback((path) => {
    throwTypeError({ value: path, name: "unset path", type: ["string"] });

     if (isUndefined(path)) {
        if (debugRef.current) {
          log.state("UNSET");
        }

        setStates({});
        return {};
      }

    if (isUndefined(get(path))) {
      return statesRef.current;
    }


    setStates((prevState) => {

      const newState = structuredClone(prevState);

      let level = newState;

      const parts = parsePath(path);
      const last = parts.pop();

      for (const part of parts) {
        // impossible d'remove[] → ignore
        if (part === "__PUSH__") {
          return newState;
        }

        // chemin inexistant
        if (!(part in level)) {
          return newState;
        }

        level = level[part];
        if (level == null) {
          return newState;
        }
      }

      if (isArray(level) && /^\d+$/.test(last)) {
        const index = Number(last);
        if (index >= 0 && index < level.length) {
          level.splice(index, 1);

          if (debugRef.current) {
            log.state(`UNSET ${path}`);
          }
        }
      } else {
        if (last in level) {
          delete level[last];

          if (debugRef.current) {
            log.state(`UNSET ${path}`);
          }
        }
      }

      return newState;
    });
  }, [get, parsePath]);

  // ---------------------- return ----------------------

  return {
    values: states,
    states,
    set,
    get,
    unset
  };
};
