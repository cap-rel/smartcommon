import { useDispatch, useSelector } from "react-redux";
import { flatMap, forEach, includes, isEmpty, isNil, isUndefined, keys, startsWith } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";

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

  // Stable references to st methods (already memoized in useStates)
  const { set: stSet, get: stGet, unset: stUnset, values: stValues } = st;

  // Keep latest debug value accessible inside memoized callbacks without bloating deps
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
  const set = useCallback((storage, path, value) => {
    stSet(path, value);

    const localStorage = local.get("global") ?? {};
    const sessionStorage = session.get("global") ?? {};

    delete localStorage[path];
    delete sessionStorage[path];

    local.set("global", localStorage);
    session.set("global", sessionStorage);

    if (storage === "local") {
      if (debugRef.current) {
        log.globalState(`SET LOCAL ${path} =>`, value);
      }

      return local.set("global", { ...local.get("global"), [path]: value });
    }

    if (storage === "session") {
      if (debugRef.current) {
        log.globalState(`SET SESSION ${path} =>`, value);
      }

      return session.set("global", { ...session.get("global"), [path]: value });
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

    const localPathsToUnset = flatMap(localStorage, (_, p) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(p, path) ? [p] : [];
    });

    if (!isEmpty(localPathsToUnset)) {
      forEach(localPathsToUnset, (p) => delete localStorage[p]);

      if (debugRef.current) {
        log.globalState(`UNSET LOCAL ${path}`);
      }

      return local.set("global", localStorage);
    }

    const sessionStorage = session.get("global") ?? {};

    const sessionPathsToUnset = flatMap(sessionStorage, (_, p) => {
      // TODO if i'ts "first", "firstname" will be deleted too => to correct
      return startsWith(p, path) ? [p] : [];
    });

    if (!isEmpty(sessionPathsToUnset)) {
      forEach(sessionPathsToUnset, (p) => delete sessionStorage[p]);

      if (debugRef.current) {
        log.globalState(`UNSET SESSION ${path}`,);
      }

      return session.set("global", sessionStorage);
    }

    if (debugRef.current) {
      log.globalState(`UNSET ${path}`,);
    }
  }, [stUnset]);

  // ---------------------- initial seeding ----------------------

  useEffect(() => {
    forEach(initialLocal, (value, path) => {
      if (isUndefined(stGet(path))) {
        set("local", path, value);
      }
    });

    forEach(initialSession, (value, path) => {
      if (isUndefined(stGet(path))) {
        set("session", path, value);
      }
    });

    forEach(initialMemory, (value, path) => {
      if (isUndefined(stGet(path))) {
        set(null, path, value);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------- useEffect dispatch ----------------------

  useEffect(() => {
    dispatch(setGlobalStates(stValues));
  }, [dispatch, stValues]);

  // ---------------------- scoped setters (stable) ----------------------

  const localScope = useMemo(() => ({
    set: (path, value) => set("local", path, value),
  }), [set]);

  const sessionScope = useMemo(() => ({
    set: (path, value) => set("session", path, value),
  }), [set]);

  // ---------------------- return (stable object) ----------------------

  return useMemo(() => ({
    values: globalStates,
    get,
    getStorage,
    set,
    unset,
    local: localScope,
    session: sessionScope,
  }), [globalStates, get, getStorage, set, unset, localScope, sessionScope]);
};
