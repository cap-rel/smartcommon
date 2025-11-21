import { useDispatch, useSelector } from "react-redux"; 

import { useLibConfig } from "lib/hooks";

import { useRefreshAccessToken } from "../useRefreshAccessToken";
import { isFunction } from "lib/utils";

export const useFetchApi = (deviceId) => {
    const { api } = useLibConfig();
    
    const { url, errors: apiErrors } = api ?? {};

    const refreshAccessToken = useRefreshAccessToken(deviceId);

    const { access_token, tokenExpiry } = useSelector(state => state.user);

    const fetchApi = async (path, body, request = {}, errors = {}) => {
        // Check if token needs refresh (refresh 5 min before expiry)
        if (Date.now() > tokenExpiry - 300000) {
            await refreshAccessToken();
        }

        const response = await fetch(`${url}${path}`, {
            ...request,
            headers: {
                Authorization: `Bearer ${access_token}`,
                "X-DEVICEID": deviceId,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined
        });
        
        const data = await response.json();

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
            
            throw new Error(data);
        }

        return data;
    };

    const GET = (path, request, errors) => fetchApi(path, undefined, { ...request, method: "GET" }, errors);

    const POST = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "POST" }, errors);

    const PUT = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "PUT" }, errors);

    const DELETE = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "DELETE" }, errors);

    return { fetchApi, GET, POST, PUT, DELETE };
};