import { useDispatch, useSelector } from "react-redux";

import { useLibConfig } from "lib/hooks";
import { unsetUser } from "lib/global-state";
import { log } from "lib/utils";
import { toString } from "lodash";

export const useLogout = (deviceId) => {
    const { api } = useLibConfig();
        
    const { url, errors: apiErrors } = api ?? {};

    const dispatch = useDispatch();
    
    const { accessToken } = useSelector(state => state.user);

    const logout = async (request = {}, errors = {}) => {
        const response = await fetch(`${url}logout`, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${accessToken}`,
                "X-DEVICEID": deviceId
            },
            ...request
        });

        const data = await response.json();

        const { ok, status } = response;
        
        if (!ok) {
          const errorAction = errors[status] ?? apiErrors[status];
        
          if (isFunction(errorAction)) {
            errorAction();
          }

          log.apiError(`POST - ${toString(status).toUpperCase()}`, `${url}logout`, data.message);
        
        //   throw new Error(json);
        }

        log.apiSuccess(`POST - ${toString(status).toUpperCase()}`, `${url}logout`);

        dispatch(unsetUser());

        return data;
    };

    return logout;
};