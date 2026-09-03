import { useDispatch, useSelector } from "react-redux"; 
import { toString, isFunction } from "lodash";

import { useLibConfig } from "lib/hooks";

import { useRefreshAccessToken } from "../useRefreshAccessToken";
import { log } from "lib/utils";

/**
 * Performs one authenticated request, retrying once the token has been
 * refreshed on a 401. Lives at module scope: it is self-recursive, and a
 * recursive function declared in a component body is render-scope code.
 *
 * @param {object} ctx - Values captured from the render that issued the call.
 */
const performFetch = async (ctx, path, body, request = {}, errors = {}) => {
    const { url, deviceId, accessToken, tokenExpiry, refreshAccessToken, apiErrors } = ctx;

    // Check if token needs refresh (refresh 5 min before expiry)
    if (Date.now() > tokenExpiry - 300000) {
        await refreshAccessToken();
    }

    const response = await fetch(`${url}${path}`, {
        ...request,
        headers: {
            Authorization: `Bearer ${accessToken}`,
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

            return await performFetch(ctx, path, body, request, errors);
        }

        const errorAction = errors[status] ?? apiErrors[status];

        if (isFunction(errorAction)) {
            errorAction();
        }

        log.apiError(`${request.method} - ${toString(status).toUpperCase()}`, `${url}${path}`, data.message);

        throw new Error(data);
    }

    log.apiSuccess(`${request.method} - ${toString(status).toUpperCase()}`, `${url}${path}`);

    return data;
};

/**
 * @deprecated Part of the legacy useApiTest2 auth layer. Its 401 handler retries
 * recursively with no upper bound (see performFetch above), so it can loop if the
 * backend keeps rejecting. Use `useApi` instead. Kept for backward-compat only.
 */
export const useFetchApi = (deviceId) => {
    const { api } = useLibConfig();

    const { url, errors: apiErrors } = api ?? {};

    const refreshAccessToken = useRefreshAccessToken(deviceId);

    const { accessToken, tokenExpiry } = useSelector(state => state.user);

    const fetchApi = (path, body, request = {}, errors = {}) => performFetch(
        { url, deviceId, accessToken, tokenExpiry, refreshAccessToken, apiErrors },
        path,
        body,
        request,
        errors
    );

    const GET = (path, request, errors) => fetchApi(path, undefined, { ...request, method: "GET" }, errors);

    const POST = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "POST" }, errors);

    const PUT = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "PUT" }, errors);

    const DELETE = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "DELETE" }, errors);

    return { fetchApi, GET, POST, PUT, DELETE };
};