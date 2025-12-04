import { useDispatch, useSelector } from "react-redux";
import { forEach, isNil, isUndefined, mapKeys } from "lodash";

import { useStates } from "lib/hooks";
import { setGlobalStates } from "lib/global-state";
import { getLocal, getSession, log, removeLocal, removeSession, setLocal, setSession } from "lib/utils";
import { useEffect } from "react";

export const useGlobalStates = ({ initialStates: initialGlobalStates = {}, debug = false }) => {
  const { local: initialLocal, session: initialSession, memory: initialMemory } = initialGlobalStates;

  const dispatch = useDispatch();
  const globalStates = useSelector(state => state.global) ?? {};

  const { states, set, get, unset } = useStates({ initialStates: globalStates });

  useEffect(() => {
    forEach(initialLocal, (value, path) => {
      if (isUndefined(get(path))) {
        setGlobal(path, value, "local");
      }
    });

    forEach(initialSession, (value, path) => {
      if (isUndefined(get(path))) {
        setGlobal(path, value, "session");
      }
    });

    forEach(initialMemory, (value, path) => {
      if (isUndefined(get(path))) {
        setGlobal(path, value);
      }
    });
  }, []);

  useEffect(() => {
    dispatch(setGlobalStates(states));
  }, [states]);

  const getGlobal = (path) => {
    return get(path);
  };

  // TODO faire le cas où on veut set tout le globalState => path = "" ou value = undefined ?
  // TODO peut-être faire le cas ou le state ne change pas (on est dans le même storage et la valeur est la même)
  const setGlobal = (path, value, storage = "memory") => {
    set(path, value);

    const local = getLocal("global") ?? {};
    const session = getSession("global") ?? {};

    delete local[path];
    delete session[path];

    setLocal("global", local);
    setSession("global", session);

    if (storage === "local") {
      if (debug) {
        log.globalState(`SET LOCAL ${path} =>`, value);
      }

      return setLocal("global", { ...getLocal("global"), [path]: value });
    } 

    if (storage === "session") {
      if (debug) {
        log.globalState(`SET SESSION ${path} =>`, value);
      }

      return setSession("global", { ...getSession("global"), [path]: value });
    }

    if (debug) {
      log.globalState(`SET ${path} =>`, value);
    }
  };

  const unsetGlobal = (path) => {
    unset(path);

    if (isNil(path)) {
      if (debug) {
        log.globalState("UNSET");
      }

      removeLocal("global");
      return removeSession("global");
    }

    const local = getLocal("global") ?? {};
    const isInLocal = mapKeys(local).includes(path);

    if (isInLocal) {
      delete local[path];

      if (debug) {
        log.globalState(`UNSET LOCAL ${path}`);
      }

      return setLocal("global", local);
    }

    const session = getSession("global") ?? {};
    const isInSession = mapKeys(session).includes(path);

    if (isInSession) {
      delete session[path];

      if (debug) {
        log.globalState(`UNSET SESSION ${path}`,);
      }

      return setSession("global", session);
    }

    if (debug) {
      log.globalState(`UNSET ${path}`,);
    }
  };

  return { globalStates, getGlobal, setGlobal, unsetGlobal };
};