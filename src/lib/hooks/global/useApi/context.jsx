import ky from "ky";
import { floor, isUndefined } from "lodash";
import { v4 } from "uuid";

import { log, navigatorInfo, throwTypeError } from "lib/utils";
import { useGlobalStates, useLibConfig } from "lib/hooks";
import { loginMap } from "lib/hooks/useApiTest2/useLogin"; 
import { refreshAccessTokenMap } from "lib/hooks/useApiTest2/useRefreshAccessToken";

export const useApiContext = () => {
    const { api: apiConfig } = useLibConfig();
    
    const { prefixUrl, timeout } = apiConfig ?? {};

    // ---------------------- globalStates ----------------------

    const gst = useGlobalStates();

    const { deviceId, user } = gst.values;

    if (isUndefined(deviceId)) {
        gst.local.set("deviceId", v4());
    }

    const { accessToken, refreshToken, tokenExpiry, rememberMe } = user ?? {};

    // ---------------------- circuit ----------------------

    let circuitOpenUntil = 0;

    const isCircuitOpen = () => Date.now() < circuitOpenUntil;

    const openCircuit = (ms = 10000) => {
        circuitOpenUntil = Date.now() + ms;
    };

    // ---------------------- baseApi ----------------------

    const baseApi = ky.create({
        prefixUrl,
        // retry: {},
        timeout,
        // throwHttpErrors: false,
        // onDownloadProgress,
        // onUploadProgress,
        // fetch,
        // context,
        headers: {
            "X-DEVICEID": deviceId,
        },
        hooks: {
            beforeRequest: [
                (request, options, state) => {
                    const { method, url } = request;
                    const { delay } = options;

                    if (isCircuitOpen()) {
                        log.apiError(`${method} - BLOCKED`, url);

                        return Promise.reject(new Error("Circuit breaker open – requests blocked"));
                    }

                    if (!navigatorInfo.isOnLine) {
                        log.apiError(`${method} - NO CONNECTION`, url);

                        openCircuit(5000);

                        return Promise.reject(new Error("No internet connection"));
                    }

                    log.apiLoading(`${method} - LOADING`, url);

                    if (delay) {
                        return new Promise(response => setTimeout(response, delay));
                    }
                }
            ],
            afterResponse: [
                (request, options, response) => {
                    const { method, url } = request;
                    const { ok, status } = response;

                    if (!ok) {
                        log.apiError(`${method} - ${status}`, url);
                    } else {
                        log.apiSuccess(`${method} - ${status}`, url);
                    }
                }
            ]
        }
    });

    // ---------------------- refresh ----------------------

    let refreshPromise = null;

    const refresh = () => {   
        if (!refreshPromise) {
            refreshPromise = baseApi
                .get("refresh", {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`
                    }
                })
                .json()
                .then((data) => {
                    const mappedData = refreshAccessTokenMap(data);

                    gst[rememberMe ? "local" : "session"].set("user", {
                        ...user,
                        ...mappedData,
                        tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                    });
                })
                .catch(() => gst.unset("user"))
                .finally(() => refreshPromise = null);
        }

        return refreshPromise;
    };

    // ---------------------- publicApi ----------------------

    const publicApi = baseApi.extend({});

    // ---------------------- entities ----------------------

    const entities = (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi.get(options.url ?? "login", options).json();
    };

    // ---------------------- login ----------------------

    const login = (data, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi
            .post(options.url ?? "login", {
                json: data,
                 ...options
            })
            .json()
            .then((data) => {
                const mappedData = loginMap(data);

                const { rememberMe, expiresIn } = mappedData;

                gst[rememberMe ? "local" : "session"].set("user", {
                    ...mappedData,
                    tokenExpiry: floor(Date.now() / 1000) + expiresIn 
                });

                return mappedData;
            });
    };

    // ---------------------- privateApi ----------------------

    const privateApi = baseApi.extend({
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        hooks: {
            beforeRequest: [
                async () => {
                    if (floor(Date.now() / 1000) > tokenExpiry) {
                        await refresh();
                    }
                }
            ],
            afterResponse: [
                async (request, options, response) => {
                    const { status } = response;

                    if (status === 401) {
                        try {
                            await refresh();

                            return privateApi(request.url.replace(prefixUrl, ""), options);
                        } catch (error) {
                            openCircuit(30000);

                            throw error;
                        }
                    }

                    if (status >= 500) {
                        openCircuit(5000);
                    }
                   
                }
            ]
        }
    });

    // ---------------------- logout ----------------------

    const logout = (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? "logout", options)
            .json()
            .then(() => gst.unset("user"));
    };

    // ---------------------- device ----------------------

    const device = (data, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? "device", {
                json: data,
                ...options
            })
            .json()
            .then((data) => {
                const mappedData = refreshAccessTokenMap(data);

                gst[rememberMe ? "local" : "session"].set("user",  {
                        ...user,
                        ...mappedData,
                        tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                });

                return mappedData
            });
    };

    // ---------------------- return ----------------------

    return {
        entities,
        login,
        logout,
        device,
        public: publicApi,
        private: privateApi,
    };
};