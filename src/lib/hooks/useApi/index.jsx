import { v4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";

import { getLocal, setLocal, isEmpty, isFunction } from "lib/utils";
import { useLibConfig } from "lib/hooks";
import { setUser, unsetUser } from "lib/global-state";

export const useApi = () => {
    const { api } = useLibConfig();

    const { url, errors: apiErrors } = api ?? {};

    let appKeyId = getLocal("HTTP_X_DEVICEID");

    if (isEmpty(appKeyId)) {
        appKeyId = v4();
        setLocal("HTTP_X_DEVICEID", appKeyId);
    }

    const dispatch = useDispatch();
    
    const user = useSelector(state => state.user);
    
    const { access_token, refresh_token, tokenExpiry } = user ?? {};

    const login = async (loginInfo, request = {}, errors = {}) => {
        const response = await fetch(`${url}login`, {
            method: 'POST',
            headers: {
                "X-DEVICEID": appKeyId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginInfo),
            ...request
        });

        const json = await response.json();

        const { ok, status } = response;
        
        if (!ok) {
            const errorAction = errors[status] ?? apiErrors[status];
            
            if (isFunction(errorAction)) {
                errorAction();
            }
            
            throw new Error(json);
        }

        const data = json?.data ?? {};

        const newUser = { ...data, tokenExpiry: Date.now() + (data.expires_in * 1000) };

        dispatch(setUser(newUser));

        return json;
    };

    const logout = async (request = {}, errors = {}) => {
        const response = await fetch(`${url}logout`, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${access_token}`,
                "X_DEVICEID": appKeyId
            },
            ...request
        });

        const json = await response.json();

        // const { ok, status } = response;
        
        // if (!ok) {
        //   const errorAction = errors[status] ?? apiErrors[status];
        
        //   if (isFunction(errorAction)) {
        //     errorAction();
        //   }
        
        //   throw new Error(json);
        // }

        dispatch(unsetUser());

        return json;
    };

    const refreshAccessToken = async () => {
        const response = await fetch(`${url}refresh`, {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${refresh_token}`,
                "X_DEVICEID": appKeyId
            }
        });

        const json = await response.json();

        if (!response.ok) {
            await logout();
            throw new Error('Session expired. Please login again.');
            // throw new Error(json);
        }

        const { access_token, refresh_token: refreshToken, token_expires_in } = json?.data ?? {};

        const refreshedUser = { ...user, access_token, refresh_token: refreshToken, tokenExpiry: Date.now() + (token_expires_in * 1000)};
        
        dispatch(setUser(refreshedUser));
    }

    const fetchApi = async (path, body, request = {}, errors = {}) => {
        // Check if token needs refresh (refresh 5 min before expiry)
        if (Date.now() > tokenExpiry - 300000) {
            await refreshAccessToken();
        }

        const response = await fetch(`${url}${path}`, {
            ...request,
            headers: {
                Authorization: `Bearer ${access_token}`,
                "X_DEVICEID": appKeyId,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined
        });
        
        const json = await response.json();

        const { ok, status } = response;
        
        if (!ok) {
            if (response.status === 401) {
                await refreshAccessToken();
                
                return await fetchApi(path, request, errors)
            }
            
            const errorAction = errors[status] ?? apiErrors[status];
            
            if (isFunction(errorAction)) {
                errorAction();
            }
            
            throw new Error(json);
        }


        return json;
    };

    const GET = (path, request, errors) => fetchApi(path, undefined, { ...request, method: "GET" }, errors);

    const POST = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "POST" }, errors);

    const PUT = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "PUT" }, errors);

    const DELETE = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "DELETE" }, errors);

    return {
        login,
        logout,
        fetchApi,
        GET,
        PUT,
        POST,
        DELETE
    }
};
