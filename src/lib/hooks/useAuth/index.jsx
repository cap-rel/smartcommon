import { useContext } from "react";
import { AuthContext } from "../../components";
import { createContext } from "react";
import { getLocal, setLocal, isEmpty, isFunction } from "../../utils";
import { v4 } from "uuid";
import { useLibConfig } from "../useLibConfig";
import { useDispatch, useSelector } from "react-redux";
import { setUser, unsetUser } from "../../global-state";

export const useAuth = () => {
    const { auth } = useLibConfig();

    const { url, errors: apiErrors } = auth?.api ?? {};

    let appKeyId = getLocal("HTTP_X_APP_ID");

    if (isEmpty(appKeyId)) {
        appKeyId = v4();
        setLocal("HTTP_X_APP_ID", appKeyId);
    }

    const dispatch = useDispatch();
    
    const user = useSelector(state => state.user);
    
    const { access_token, refresh_token, tokenExpiry } = user ?? {};

    const login = async (loginInfo, request = {}, errors = {}) => {
        const response = await fetch(`${url}login`, {
            method: 'POST',
            headers: {
                HTTP_X_APP_ID: appKeyId,
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

        const newUser = { ...data, tokenExpiry: Date.now() + (data.expires_in * 1000) }

        dispatch(setUser(newUser));

        return json;
    };

    const logout = async (request = {}, errors = {}) => {
        const response = await fetch(`${url}logout`, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${access_token}`,
                HTTP_X_APP_ID: appKeyId
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
                HTTP_X_APP_ID: appKeyId
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
                HTTP_X_APP_ID: appKeyId,
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
