import ky from "ky";
import { floor, isEmpty, isUndefined, replace } from "lodash";
import { v4 } from "uuid";

import { log, navigatorInfo, throwTypeError } from "lib/utils";
import { useGlobalStates, useLibConfig } from "lib/hooks";
import { loginMap } from "lib/hooks/useApiTest2/useLogin"; 
import { refreshAccessTokenMap } from "lib/hooks/useApiTest2/useRefreshAccessToken";

export const useApiContext = () => {
    const libConfig = useLibConfig();

    const { debug: libDebug, api } = libConfig;
    
    const { prefixUrl, timeout, debug: apiDebug } = api ?? {};

    const debug = isUndefined(apiDebug) ? libDebug : apiDebug;

    // ---------------------- globalStates ----------------------

    const gst = useGlobalStates();

    const { deviceId, user } = gst.values;

    if (isUndefined(deviceId)) {
        gst.local.set("deviceId", v4());
    }

    const { accessToken, refreshToken, tokenExpiry, rememberMe, deviceOptions } = user ?? {};

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
                        if (debug) {
                            log.apiError(`${method} - BLOCKED`, url);
                        }

                        return Promise.reject(new Error("Circuit breaker open – requests blocked"));
                    }

                    if (!navigatorInfo.isOnLine) {
                        if (debug) {
                            log.apiError(`${method} - NO CONNECTION`, url);
                        }

                        openCircuit(5000);

                        return Promise.reject(new Error("No internet connection"));
                    }

                    if (debug) {
                        log.apiLoading(`${method} - LOADING`, url);
                    }

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
                        if (debug) {
                            log.apiError(`${method} - ${status}`, url);
                        }
                    } else {
                        if (debug) {
                            log.apiSuccess(`${method} - ${status}`, url);
                        }
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
                .catch((error) => {
                    gst.unset("user");
                    throw error;
                })
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

    const login = (body, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi
            .post(options.url ?? "login", {
                json: body,
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
                async (request, options, state) => {
                    state.hasRefreshed = state.hasRefreshed ?? false;

                    if (floor(Date.now() / 1000) > tokenExpiry) {
                        if (state.hasRefreshed) {
                            throw new Error("Token refresh already attempted"); 
                        }

                        state.hasRefreshed = true;
                        await refresh();
                    }

                    request.headers.set("Authorization", `Bearer ${accessToken}`);
                    request.headers.set("X-DEVICEID", deviceId);
                }
            ],
            afterResponse: [
                async (request, options, response) => {
                    const { status } = response;

                    if (status === 401) {
                        const state = options.context ?? {};
                        state.hasRetried = state.hasRetried ?? false;

                        if (state.hasRetried) {
                            openCircuit(30000);
                            gst.unset("user");
                            throw new Error("Unauthorized after refresh");
                        }

                        state.hasRetried = true;
                        try {
                            await refresh();

                            return privateApi(replace(request.url, prefixUrl, ""), {
                                ...options,
                                context: state
                            });
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
            .then(() => gst.unset("user"))
            .catch((error) => {
                throw error;
            })
    };

    // ---------------------- device ----------------------

    const device = (body, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        const { label, uuid } = body;

        const noUuid = (uuid === "noDevice" || isEmpty(deviceOptions));

        return privateApi
            .post(options.url ?? "device", {
                json: { label: label || undefined, uuid: noUuid ? deviceId : uuid },
            })
            .json()
            .then((data) => {
                const mappedData = refreshAccessTokenMap(data);

                gst[rememberMe ? "local" : "session"].set("user",  {
                        ...user,
                        ...mappedData,
                        tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                });

                if (!noUuid) {
                    gst.local.set("deviceId", uuid);
                }

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