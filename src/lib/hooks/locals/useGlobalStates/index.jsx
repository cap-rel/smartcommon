import { useDispatch, useSelector } from "react-redux";
import { forEach, isNil, isPlainObject, isUndefined, keys, mapKeys } from "lodash";
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
    dispatch(setGlobalStates(st.values));
  }, [st.values]);

  // ---------------------- get ----------------------

  const get = (path) => {
    return st.get(path);
  };

  // ---------------------- getStorage ----------------------

  const getStorage = (path) => {
    if (isUndefined(get(path))) {
      return undefined;
    }

    if (keys(local.get("global")).includes(path)) {
      return "local";
    }

    if (keys(session.get("global")).includes(path)) {
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
    const isInLocal = mapKeys(localStorage).includes(path);

    if (isInLocal) {
      delete localStorage[path];

      if (debug) {
        log.globalState(`UNSET LOCAL ${path}`);
      }

      return local.set("global", localStorage);
    }

    const sessionStorage = session.get("global") ?? {};
    const isInSession = mapKeys(sessionStorage).includes(path);

    if (isInSession) {
      delete sessionStorage[path];

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
    set,
    unset,
    local: {
      set: (path, value) => set("local", path, value),
    },
    session: {
      set: (path, value) => set("session", path, value),
    }
  };
};