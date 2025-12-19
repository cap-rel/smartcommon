import { useDispatch, useSelector } from "react-redux";
import { flatMap, forEach, includes, isEmpty, isNil, isUndefined, keys, startsWith, isEqual, map } from "lodash";
import { useEffect } from "react";

import { useStates } from "lib/hooks";
import { setGlobalStates } from "lib/global-state";
import { session, local, log, throwTypeError } from "lib/utils";

export const useGlobalStates = (props = {}) => {
  throwTypeError({ value: props, name: "useGlobalStates props", type: ["plain object"] })

  const { initialStates = {}, debug = false } = props;

  throwTypeError({ value: initialStates, name: "initialStates", type: ["plain object"] });
  
  const { local: initialLocal, session: initialSession, ...initialMemory } = initialStates;

  const dispatch = useDispatch();
  const globalStates = useSelector(state => state.global) ?? {};

  const st = useStates({ initialStates: globalStates });

  // ---------------------- useEffect ----------------------

  useEffect(() => {
    forEach(initialLocal, (value, path) => {
      if (isUndefined(st.get(path))) {
        set("local", path, value);
      }
    });

    forEach(initialSession, (value, path) => {
      if (isUndefined(st.get(path))) {
        set("session", path, value);
      }
    });

    forEach(initialMemory, (value, path) => {
      if (isUndefined(st.get(path))) {
        set(null, path, value);
      }
    });
  }, []);

  // ---------------------- useEffect dispatch ----------------------

  useEffect(() => {
    if (!isEqual(st.values, globalStates)) {
      dispatch(setGlobalStates(st.values));
    }
  }, [st.values]);

  useEffect(() => {
    if (!isEqual(st.values, globalStates)) {
      map(globalStates, (value, key) => st.set(key, value));
    }
  }, [globalStates]);

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
  const set = (storage, path, value) => {
    st.set(path, value);

    const localStorage = local.get("global") ?? {};
    const sessionStorage = session.get("global") ?? {};

    delete localStorage[path];
    delete sessionStorage[path];

    local.set("global", localStorage);
    session.set("global", sessionStorage);

    if (storage === "local") {
      if (debug) {
        log.globalState(`SET LOCAL ${path} =>`, value);
      }

      return local.set("global", { ...local.get("global"), [path]: value });
    } 

    if (storage === "session") {
      if (debug) {
        log.globalState(`SET SESSION ${path} =>`, value);
      }

      return session.set("global", { ...session.get("global"), [path]: value });
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

    const localPathsToUnset = flatMap(localStorage, (value, path) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(path, path) ? [path] : [];
    });
    
    if (!isEmpty(localPathsToUnset)) {
      forEach(localPathsToUnset, (path) => delete localStorage[path]);

      if (debug) {
        log.globalState(`UNSET LOCAL ${path}`);
      }

      return local.set("global", localStorage);
    }

    const sessionStorage = session.get("global") ?? {};

    const sessionPathsToUnset = flatMap(sessionStorage, (value, path) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(path, path) ? [path] : [];
    });

    if (!isEmpty(sessionPathsToUnset)) {
      forEach(sessionPathsToUnset, (path) => delete sessionStorage[path]);

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
    values: globalStates,
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