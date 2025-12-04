import { useDispatch, useSelector } from "react-redux";
import { isNil, mapKeys } from "lodash";

import { useStates } from "lib/hooks";
import { setGlobalStates } from "lib/global-state";
import { getLocal, getSession, log, removeLocal, removeSession, setLocal, setSession } from "lib/utils";
import { useEffect } from "react";

export const useGlobalStates = ({ initialStates: initialGlobalStates, debug = false }) => {
  // initialStates = { local, session, memory };
  const dispatch = useDispatch();
  const globalStates = useSelector(state => state.global) ?? {};

  const { states, set, get, unset } = useStates({ initialStates: globalStates });

  useEffect(() => {
    dispatch(setGlobalStates(states));
  }, [states]);

  const getGlobal = (path) => {
    return get(path);
  };

  const setGlobal = (path, value, storage) => {
    set(path, value);

    const local = getLocal("global") ?? {};
    const session = getSession("global") ?? {};

    delete local[path];
    delete session[path];

    setLocal("global", local);
    setSession("global", session);

    if (storage === "local") {
      const local2 = getLocal("global") ?? {}; 
      if (debug) {
        log.globalState(`SET LOCAL ${path} =>`, value);
      }

      return setLocal("global", { ...local2, [path]: value });
    } 

    if (storage === "session") {
      const session2 = getSession("global") ?? {}; 
      if (debug) {
        log.globalState(`SET SESSION ${path} =>`, value);
      }

      return setSession("global", { ...session2, [path]: value });
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
        log.globalState(`UNSET LOCAL ${path} =>`, value);
      }

      return setLocal("global", local);
    }

    const session = getSession("global") ?? {};
    const isInSession = mapKeys(session).includes(path);

    if (isInSession) {
      delete session[path];

      if (debug) {
        log.globalState(`UNSET SESSION ${path} =>`, value);
      }

      return setSession("global", session);
    }

    if (debug) {
      log.globalState(`UNSET ${path} =>`, value);
    }
  };

  return { globalStates, getGlobal, setGlobal, unsetGlobal };
};