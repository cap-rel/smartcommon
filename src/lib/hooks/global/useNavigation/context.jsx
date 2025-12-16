import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { isFunction, isPlainObject, isUndefined, last } from "lodash";
import { useEffect } from "react";

import { log, throwTypeError } from "lib/utils";
import { useGlobalStates } from "lib/hooks";

// TODO .query(params) .scroll(false) .preserveState()

export const useNavigationContext = (props = {}) => {
    throwTypeError({ value: props, name: "useNavigation props", type: ["plain object"] })
    
    const { debug = false } = props;

    const initialStates = { session: { history: [] } };
    const gst = useGlobalStates({ initialStates });

    const { history } = gst.values;

    const location = useLocation();

    const { key, pathname, state } = location;

    const filteredLocation = { ...location, state: !isPlainObject(state) ? {} : state };

    useEffect(() => {
        const lastLocation = last(history);

        if (!lastLocation || lastLocation.key !== key) {
            gst.session.set("history[]", filteredLocation);
            
            if (debug) {
                log.location(`pathname = ${pathname}, state =`, state);
            }
        }
    }, [location]);

    const navigate = useNavigate();

    const params = useParams();
    const searchParams = useSearchParams();

    const navBuilder = () => {
        const options = { replace: false, state: filteredLocation.state };

        const builder = {
            replace: () => {
                options.replace = true;
                return builder;
            },
            state: (state) => {
                if (!isUndefined(state)) {
                    options.state = isFunction(state) ? state(options.state) : state;
                }

                return builder;
            },
            to: (pathname) => {
                if (!isUndefined(pathname)) {
                    navigate(pathname, options);
                }
            },
        };

        return builder;
    };

    const nav = navBuilder();

    // ---------------------- return ----------------------

    return  {
        params,
        searchParams,
        location: filteredLocation,
        prevLocation: history.length > 2 ? history[history.length - 2] : undefined,
        navigate,
        ...nav
    };
};