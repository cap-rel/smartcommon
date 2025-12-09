import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGlobalStates } from "../export";
import { isFunction, last } from "lodash";
import { useEffect } from "react";
import { log } from "lib/utils";

export const useNavigationContext = ({ debug = false }) => {
    const initialStates = { session: { history: [] } };
    const gst = useGlobalStates({ initialStates });

    const history = gst.values?.history;

    const location = useLocation();

    useEffect(() => {
        const { key, pathname, state } = location;
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
        now: location,
        prev: history[history.length - 2],
        to: navigate,
        updateState: (state) => navigate(location.pathname, { state: isFunction(state) ? state(location.state) : state }),
        replaceTo: (pathname) =>  navigate(pathname, { replace: true })
    };
};