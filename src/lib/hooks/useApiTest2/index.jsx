import { v4 } from "uuid";
import { isEmpty } from "lodash";

import { getLocal, setLocal } from "lib/utils";

import { useLogin } from "./useLogin";
import { useLogout } from "./useLogout";
import { useFetchApi } from "./useFetchApi";
import { useIdentifyDevice } from "./useIdentifyDevice";
import { useGetEntities } from "./useGetEntities";

/**
 * @deprecated Legacy Redux+fetch auth layer. Use `useApi` (top-level barrel)
 * instead: it has the circuit breaker, single-refresh dedup, dead-session eject
 * and enriched errors. This module survives only because its sub-maps
 * (loginMap, refreshAccessTokenMap) are still consumed by useApi -- do not adopt
 * the hook itself in new code.
 */
export const useApiTest2 = () => {
    let deviceId = getLocal("HTTP_X_DEVICEID");

    if (isEmpty(deviceId)) {
        deviceId = v4();
        setLocal("HTTP_X_DEVICEID", deviceId);
    }

    const login = useLogin(deviceId);
    
    const logout = useLogout(deviceId);
    
    const { fetchApi, GET, POST, PUT, DELETE } = useFetchApi(deviceId);
    
    const getEntities = useGetEntities(deviceId);

    const identifyDevice = useIdentifyDevice(deviceId);

    return {
        getEntities,
        login,
        logout,
        fetchApi,
        GET,
        PUT,
        POST,
        DELETE,
        identifyDevice
    };
};
