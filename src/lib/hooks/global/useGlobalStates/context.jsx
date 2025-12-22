import { useDispatch, useSelector } from "react-redux";
import { flatMap, forEach, includes, isEmpty, isNil, isUndefined, keys, startsWith, isEqual, map, reduce, isArray } from "lodash";
import { useEffect } from "react";

import { useStates } from "lib/hooks";
import { setGlobalStates } from "lib/global-state";
import { session, local, log, throwTypeError } from "lib/utils";

// TODO (prevValue) => ne fonctionne pas 

export const useGlobalStatesContext = (props = {}) => {
  throwTypeError({ value: props, name: "useGlobalStates props", type: ["plain object"] })

  const { initialStates = {}, debug = false } = props;

  throwTypeError({ value: initialStates, name: "initialStates", type: ["plain object"] });
  
  const { local: initialLocal, session: initialSession, ...initialMemory } = initialStates;

  // const dispatch = useDispatch();
  // const globalStates = useSelector(state => state.global) ?? {};

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
  
  const st = useStates({ initialStates: reduce(storages, setInit, {}) });

  // ---------------------- useEffect ----------------------

  // useEffect(() => {
  //   forEach(initialLocal, (value, path) => {
  //     if (isUndefined(st.get(path))) {
  //       set("local", path, value);
  //     }
  //   });

  //   forEach(initialSession, (value, path) => {
  //     if (isUndefined(st.get(path))) {
  //       set("session", path, value);
  //     }
  //   });

  //   forEach(initialMemory, (value, path) => {
  //     if (isUndefined(st.get(path))) {
  //       set(null, path, value);
  //     }
  //   });
  // }, []);
  
  // useEffect(() => {
  //   dispatch(setGlobalStates(st.values))
  // }, [st.values]);

  // ---------------------- get ----------------------

  const get = (path) => {
    return st.get(path);
  };

  // ---------------------- getStorage ----------------------

  const getStorage = (path) => {
    if (isUndefined(get(path))) {
      return undefined;
    }

    if (includes(keys(local.get("global")), path)) {
      return "local";
    }

    if (includes(keys(session.get("global")), path)) {
      return "session";
    }

    return "memory";
  };

  // ---------------------- set ----------------------

  // TODO faire le cas où on veut set tout le globalState => path = "" ou value = undefined ?
  // TODO peut-être faire le cas ou le state ne change pas (on est dans le même storage et la valeur est la même)

  // TODO (prevState) => {} n'est pas géré
  const set = (storage, path, value) => {
    st.set(path, value);

    const localStorage = local.get("global") ?? {};
    const sessionStorage = session.get("global") ?? {};

    const newLocalStorage = { ...localStorage };
    const newSessionStorage = { ...sessionStorage };

    delete newLocalStorage[path];
    delete newSessionStorage[path];

    local.set("global", newLocalStorage);
    session.set("global", newSessionStorage);

    if (storage === "local") {
      if (debug) {
        log.globalState(`SET LOCAL ${path} =>`, value);
      }

      return local.set("global", { ...localStorage, [path]: value });
    } 

    if (storage === "session") {
      if (debug) {
        log.globalState(`SET SESSION ${path} =>`, value);
      }

      return session.set("global", { ...sessionStorage, [path]: value });
    }

    if (debug) {
      log.globalState(`SET ${path} =>`, value);
    }
  };

  // ---------------------- unset ----------------------

  const unset = (path) => {
    st.unset(path);

    if (isNil(path)) {
      if (debug) {
        log.globalState("UNSET");
      }

      local.unset("global");
      return session.unset("global");
    }

    const localStorage = local.get("global") ?? {};

    const localPathsToUnset = flatMap(localStorage, (value, key) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(key, path) ? [key] : [];
    });
    
    if (!isEmpty(localPathsToUnset)) {
      forEach(localPathsToUnset, (key) => delete localStorage[key]);

      if (debug) {
        log.globalState(`UNSET LOCAL ${path}`);
      }

      return local.set("global", localStorage);
    }

    const sessionStorage = session.get("global") ?? {};

    const sessionPathsToUnset = flatMap(sessionStorage, (value, key) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(key, path) ? [key] : [];
    });

    if (!isEmpty(sessionPathsToUnset)) {
      forEach(sessionPathsToUnset, (key) => delete sessionStorage[key]);

      if (debug) {
        log.globalState(`UNSET SESSION ${path}`,);
      }

      return session.set("global", sessionStorage);
    }

    if (debug) {
      log.globalState(`UNSET ${path}`,);
    }
  };

  // ---------------------- return ----------------------

  return {
    values: st.values,
    get,
    getStorage,
    set: (path, value) => set(null, path, value),
    unset,
    local: {
      set: (path, value) => set("local", path, value),
    },
    session: {
      set: (path, value) => set("session", path, value),
    }
  };
};