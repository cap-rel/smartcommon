import { useDispatch } from "react-redux";

import { useLibConfig } from "lib/hooks";
import { setUser } from "lib/global-state";
import { isFunction } from "lib/utils";

export const useLogin = (deviceId) => {
    const { api } = useLibConfig();
    
    const { url, errors: apiErrors } = api ?? {};

    const dispatch = useDispatch();

    const login = async (loginData, request = {}, errors = {}) => {
        const response = await fetch(`${url}login`, {
            method: 'POST',
            headers: {
                "X-DEVICEID": deviceId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData),
            ...request
        });

        const data = await response.json() ?? {};

        const { ok, status } = response;
        
        if (!ok) {
            const errorAction = errors[status] ?? apiErrors[status];
            
            if (isFunction(errorAction)) {
                errorAction();
            }
            
            throw new Error(data);
        }

        const newUser = { ...data, tokenExpiry: Date.now() + (data.expires_in * 1000) };

        dispatch(setUser(newUser));

        return data;
    };
    
    return login;
};