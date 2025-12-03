import { useDispatch } from "react-redux";

import { useLibConfig } from "lib/hooks";
import { setUser } from "lib/global-state";
import { isFunction, log } from "lib/utils";

import { apiMap } from "../apiMap";

export const loginMap = data => apiMap({
    userid:         { key: "id"          , transform: value => Number(value)        },
    user:           { key: "username"                                               },
    entity:         { key: "entity"                                                 },
    access_token:   { key: "accessToken"                                            },
    refresh_token:  { key: "refreshToken",                                          },
    expires_in:     { key: "expiresIn"                                              },
    token_type:     { key: "tokenType"                                              },
    rememberMe:     { key: "rememberMe"  , transform: value => value ? true : false },
    devices_choice: { key: "deviceOptions"                                          }
}, data);

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

        const mappedData = loginMap(data);

        const { ok, status } = response;
        
        if (!ok) {
            const errorAction = errors[status] ?? apiErrors[status];
            
            if (isFunction(errorAction)) {
                errorAction();
            }

            log.apiError(status, `${url}login ${data.message}`);
            
            throw new Error(data);
        }

        log.apiSuccess(status, `${url}login`);

        const newUser = { ...mappedData, tokenExpiry: Date.now() + (mappedData.expiresIn * 1000) };

        dispatch(setUser(newUser));

        return mappedData;
    };
    
    return login;
};