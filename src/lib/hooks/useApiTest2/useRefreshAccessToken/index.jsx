import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";

import { useLibConfig } from "lib/hooks";
import { setUser } from "lib/global-state";

import { useLogout } from "../useLogout";

import { apiMap } from "../apiMap";
import { log } from "lib/utils";
import { toString } from "lodash";

export const refreshAccessTokenMap = data => apiMap({
    access_token:   { key: "accessToken"                                            },
    refresh_token:  { key: "refreshToken",                                          },
    expires_in:     { key: "expiresIn"                                              },
    token_type:     { key: "tokenType"                                              },
}, data, true);

// Singleton promise to prevent concurrent refresh requests
let refreshPromise = null;

export const useRefreshAccessToken = (deviceId) => {
    const { api } = useLibConfig();

    const { url, errors: apiErrors } = api ?? {};

    const dispatch = useDispatch();

    const logout = useLogout(deviceId);

    const user = useSelector(state => state.user);

    const { refreshToken } = user;

    const refreshAccessToken = async () => {
        // If a refresh is already in progress, wait for it
        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = (async () => {
            try {
                const response = await fetch(`${url}refresh`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                        "X-DEVICEID": deviceId
                    }
                });

                const data = await response.json() ?? {};

                const mappedData = refreshAccessTokenMap(data);

                const { ok, status } = response;

                if (!ok) {
                    await logout();

                    log.apiError(`GET - ${toString(status).toUpperCase()}`, `${url}refresh`, data.message);
                    throw new Error('Session expired. Please login again.');
                }

                log.apiSuccess(`GET - ${toString(status).toUpperCase()}`, `${url}refresh`, data.message);

                const { expiresIn } = mappedData;

                const refreshedUser = { ...user, ...mappedData, expiresIn: undefined, tokenExpiry: Date.now() + (expiresIn * 1000)};

                dispatch(setUser(refreshedUser));
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    };

    return refreshAccessToken;
};