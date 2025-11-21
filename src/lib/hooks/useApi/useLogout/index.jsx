import { useDispatch, useSelector } from "react-redux";

import { useLibConfig } from "lib/hooks";
import { unsetUser } from "lib/global-state";

export const useLogout = (deviceId) => {
    const { api } = useLibConfig();
        
    const { url, errors: apiErrors } = api ?? {};

    const dispatch = useDispatch();
    
    const { access_token } = useSelector(state => state.user);

    const logout = async (request = {}, errors = {}) => {
        const response = await fetch(`${url}logout`, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${access_token}`,
                "X-DEVICEID": deviceId
            },
            ...request
        });

        const data = await response.json();

        // const { ok, status } = response;
        
        // if (!ok) {
        //   const errorAction = errors[status] ?? apiErrors[status];
        
        //   if (isFunction(errorAction)) {
        //     errorAction();
        //   }
        
        //   throw new Error(json);
        // }

        dispatch(unsetUser());

        return data;
    };

    return logout;
};