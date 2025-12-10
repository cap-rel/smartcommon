import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { isFunction, last } from "lodash";
import { useEffect } from "react";

import { log, throwTypeError } from "lib/utils";
import { useGlobalStates } from "lib/hooks";

export const useNavigationContext = (props = {}) => {
    throwTypeError({ value: props, name: "useNavigation props", type: ["plain object"] })
    
    const { debug = false } = props;

    const initialStates = { session: { history: [] } };
    const gst = useGlobalStates({ initialStates });

    const history = gst.values?.history ?? [];

    const location = useLocation();

    const { key, pathname, state } = location;

    useEffect(() => {
        const lastLocation = last(history);

        if (!lastLocation || lastLocation.key !== key) {
            gst.set("history[]", location, "session");
            
            if (debug) {
                log.location(`pathname = ${pathname}, state =`, state);
            }
        }
    }, [location]);

    const navigate = useNavigate();

    const params = useParams();
    const searchParams = useSearchParams();
    
    // ---------------------- return ----------------------

    return  {
        params,
        searchParams,
        location,
        prevLocation: history[history.length - 2],
        to: navigate,
        updateState: (state) => navigate(pathname, { state: isFunction(state) ? state(location.state) : state }),
        replaceTo: (pathname) =>  navigate(pathname, { replace: true })
    };
};