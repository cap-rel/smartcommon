import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isFunction, isPlainObject, isUndefined, last } from "lodash";
import { useEffect, useRef } from "react";

import { log, throwTypeError } from "lib/utils";
import { useLibConfig } from "lib/hooks";

// TODO .query(params) .scroll(false) .preserveState()

// Chainable navigation builder. Each step returns a NEW builder instead of
// mutating a shared `options` object: the previous version created one builder
// per render, so a `nav.replace()` left `replace: true` set for every later
// `nav.to()` of that same render.
const createNavBuilder = (navigate, pathname, options) => ({
    replace: () => createNavBuilder(navigate, pathname, { ...options, replace: true }),
    state: (state) => createNavBuilder(navigate, pathname, {
        ...options,
        state: isUndefined(state)
            ? options.state
            : isFunction(state) ? state(options.state) : state,
    }),
    to: (to) => {
        navigate(isUndefined(to) ? pathname : to, options);
    },
});

const HISTORY_MAX_ENTRIES = 50;

export const useNavigationContext = () => {    
    const libConfig = useLibConfig();

    const { debug: libDebug, navigation } = libConfig;
    
    const { debug: navigationDebug } = navigation ?? {};

    const debug = isUndefined(navigationDebug) ? libDebug : navigationDebug;

    const location = useLocation();

    const { key, pathname, state } = location;

    const filteredLocation = { ...location, state: !isPlainObject(state) ? {} : state };

    // Locations visited in this tab, oldest first. Kept in a ref (the
    // provider re-renders on every location change anyway) rather than in
    // the global state, whose every write re-renders all its subscribers.
    // A new array per visit, so consumers can compare it by identity; the
    // key check keeps a double render from recording a visit twice.
    const historyRef = useRef([]);
    if (last(historyRef.current)?.key !== key) {
        historyRef.current = [...historyRef.current, filteredLocation].slice(-HISTORY_MAX_ENTRIES);
    }
    const history = historyRef.current;

    useEffect(() => {
        if (debug) {
            log.location(`pathname = ${pathname}, state =`, state);
        }
    }, [location]);

    const navigate = useNavigate();

    // Route params are NOT resolved here on purpose: NavigationProvider sits
    // ABOVE <Routes>, so useParams() at this level returns {}. The active
    // route match is only available in the leaf component, so params are
    // read in useNavigation() (./index.jsx). useSearchParams() is fine
    // here because it reads the URL query string, not the route match.
    const searchParams = useSearchParams();

    const nav = createNavBuilder(navigate, pathname, {
        replace: false,
        state: filteredLocation.state,
    });

    // ---------------------- return ----------------------

    return  {
        searchParams,
        location: filteredLocation,
        // prevLocation: history.length > 2 ? history[history.length - 2] : undefined,
        history,
        navigate,
        ...nav
    };
};