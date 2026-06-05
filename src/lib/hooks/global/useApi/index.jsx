import { useContext, useRef } from "react";

import { ApiContext } from "lib/components";
import { log } from "lib/utils";

export { useApiContext } from "./context";

export const useApi = () => {
    const ctx = useContext(ApiContext);

    // ApiContext defaults to null (see ApiProvider/context.jsx). A null value
    // means there is no <Provider>/<ApiProvider> above this component. We still
    // return an empty object so callers do not hard-crash on destructuring, but
    // we surface the misconfiguration once per consumer instead of letting every
    // api.* access silently resolve to undefined (the original silent-failure
    // bug). Guarded by a ref so a re-rendering consumer does not spam the logs.
    const warnedRef = useRef(false);
    if ((ctx === null || ctx === undefined) && !warnedRef.current) {
        warnedRef.current = true;
        log.error(
            "useApi() called outside of an <ApiProvider>. Wrap your app in " +
            "<Provider> (or <ApiProvider>). Returning an empty api object - " +
            "all api.* calls will be no-ops."
        );
    }

    return ctx ?? {};
};
