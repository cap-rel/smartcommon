import { flatMap, forEach, includes, isEmpty, isNil, isUndefined, keys, reduce, isArray, startsWith, unset as lUnset, get as lGet } from "lodash";
import { useCallback, useMemo, useRef } from "react";

import { useLibConfig, useStates } from "lib/hooks";
import { session, local, log, throwTypeError } from "lib/utils";

// TODO (prevValue) => ne fonctionne pas

export const useGlobalStatesContext = (props = {}) => {
  throwTypeError({ value: props, name: "useGlobalStates props", type: ["plain object"] })

  const { initialStates = {} } = props;

  const libConfig = useLibConfig();

  const { debug: libDebug, globalStates } = libConfig;

  const { debug: globalStatesDebug } = globalStates ?? {};

  const debug = isUndefined(globalStatesDebug) ? libDebug : globalStatesDebug;

  throwTypeError({ value: initialStates, name: "initialStates", type: ["plain object"] });

  // ---------------------- parsePath (Parser) ----------------------
  const parsePath = (path) => {
    const parts = [];
    path.split(".").forEach(segment => {
      const regex = /([\w-]+)|\[(\d*)\]/g;
      let match;
      while ((match = regex.exec(segment)) !== null) {
        if (match[1]) parts.push(match[1]);
        else if (match[2] === "") parts.push("__PUSH__");
        else parts.push(match[2]);
      }
    });
    return parts;
  };

  // ---------------------- set ----------------------
  const setInit = (acc, value, path) => {
    const newState = { ...acc };
    const parts = parsePath(path);

    let level = newState;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      const nextKey = parts[i + 1];
      const isNextPush = nextKey === "__PUSH__";

      if (level[key] !== Object(level[key])) {
        level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
      }

      if (!(key in level)) {
        level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
      }

      level = level[key];
    }

    const lastKey = parts[parts.length - 1];

    const applyValue = (target, keyOrIndex) => {
      const newValue = typeof value === "function"
        ? value(keyOrIndex === "__PUSH__" ? target[target.length - 1] : target[keyOrIndex])
        : value;

      if (keyOrIndex === "__PUSH__") {
        target.push(newValue);
      } else {
        target[keyOrIndex] = newValue;
      }
    };

    if (lastKey === "__PUSH__") {
      if (isArray(level)) {
        level = level instanceof Object ? level : [];
      }
      applyValue(level, "__PUSH__");
    } else {
      applyValue(level, lastKey);
    }

    return newState;
  };

  const storages = { ...local.get("global"), ...session.get("global") };

  const st = useStates({ initialStates: reduce(storages, setInit, {}), debug: false });

  // Stable references to st methods (memoized inside useStates)
  const { set: stSet, get: stGet, unset: stUnset, values: stValues } = st;

  // Keep latest debug value accessible from memoized callbacks without bloating deps
  const debugRef = useRef(debug);
  debugRef.current = debug;

  // ---------------------- get ----------------------

  const get = useCallback((path) => {
    return stGet(path);
  }, [stGet]);

  // ---------------------- getStorage ----------------------

  const getStorage = useCallback((path) => {
    if (isUndefined(stGet(path))) {
      return undefined;
    }

    if (includes(keys(local.get("global")), path)) {
      return "local";
    }

    if (includes(keys(session.get("global")), path)) {
      return "session";
    }

    return "memory";
  }, [stGet]);

  // ---------------------- set ----------------------

  // TODO faire le cas où on veut set tout le globalState => path = "" ou value = undefined ?
  // TODO peut-être faire le cas ou le state ne change pas (on est dans le même storage et la valeur est la même)
  // TODO (prevState) => {} n'est pas géré
  const setByStorage = useCallback((storage, path, value) => {
    stSet(path, value);

    const localStorage = local.get("global") ?? {};
    const sessionStorage = session.get("global") ?? {};

    const newLocalStorage = { ...localStorage };
    const newSessionStorage = { ...sessionStorage };

    delete newLocalStorage[path];
    delete newSessionStorage[path];

    local.set("global", newLocalStorage);
    session.set("global", newSessionStorage);

    if (storage === "local") {
      if (debugRef.current) {
        log.globalState(`SET LOCAL ${path} =>`, value);
      }

      return local.set("global", { ...localStorage, [path]: value });
    }

    if (storage === "session") {
      if (debugRef.current) {
        log.globalState(`SET SESSION ${path} =>`, value);
      }

      return session.set("global", { ...sessionStorage, [path]: value });
    }

    if (debugRef.current) {
      log.globalState(`SET ${path} =>`, value);
    }
  }, [stSet]);

  // ---------------------- unset ----------------------

  const unset = useCallback((path) => {
    stUnset(path);

    if (isNil(path)) {
      if (debugRef.current) {
        log.globalState("UNSET");
      }

      local.unset("global");
      return session.unset("global");
    }

    const localStorage = local.get("global") ?? {};

    const localPathsToUnset = flatMap(localStorage, (_, key) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(key, path) ? [key] : [];
    });

    if (!isEmpty(localPathsToUnset) || !isUndefined(lGet(localStorage, path))) {
      forEach(localPathsToUnset, (key) => delete localStorage[key]);

      lUnset(localStorage, path);

      if (debugRef.current) {
        log.globalState(`UNSET LOCAL ${path}`);
      }

      return local.set("global", localStorage);
    }

    const sessionStorage = session.get("global") ?? {};

    const sessionPathsToUnset = flatMap(sessionStorage, (_, key) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(key, path) ? [key] : [];
    });

    if (!isEmpty(sessionPathsToUnset) || !isUndefined(lGet(sessionStorage, path))) {
      forEach(sessionPathsToUnset, (key) => delete sessionStorage[key]);

      lUnset(sessionStorage, path);

      if (debugRef.current) {
        log.globalState(`UNSET SESSION ${path}`,);
      }

      return session.set("global", sessionStorage);
    }

    if (debugRef.current) {
      log.globalState(`UNSET ${path}`,);
    }
  }, [stUnset]);

  // ---------------------- scoped setters (stable) ----------------------

  const set = useCallback((path, value) => setByStorage(null, path, value), [setByStorage]);

  const localScope = useMemo(() => ({
    set: (path, value) => setByStorage("local", path, value),
  }), [setByStorage]);

  const sessionScope = useMemo(() => ({
    set: (path, value) => setByStorage("session", path, value),
  }), [setByStorage]);

  // ---------------------- return (stable object) ----------------------

  return useMemo(() => ({
    values: stValues,
    get,
    getStorage,
    set,
    unset,
    local: localScope,
    session: sessionScope,
  }), [stValues, get, getStorage, set, unset, localScope, sessionScope]);
};
