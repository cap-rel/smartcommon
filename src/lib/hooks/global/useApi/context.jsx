import ky from "ky";
import { floor, isEmpty, isUndefined, replace } from "lodash";
import { v4 } from "uuid";
import { useMemo, useRef, useEffect } from "react";

import { log, navigatorInfo, throwTypeError } from "lib/utils";
import { useGlobalStates, useLibConfig } from "lib/hooks";
import { loginMap } from "lib/hooks/useApiTest2/useLogin";
import { refreshAccessTokenMap } from "lib/hooks/useApiTest2/useRefreshAccessToken";

export const useApiContext = () => {
    const libConfig = useLibConfig();

    const { debug: libDebug, api } = libConfig;

    const { prefixUrl, timeout, debug: apiDebug, onApiError } = api ?? {};

    const debug = isUndefined(apiDebug) ? libDebug : apiDebug;

    // ---------------------- globalStates ----------------------

    const gst = useGlobalStates();

    const { deviceId, user } = gst.values;

    // Use ref to track if deviceId was already set to avoid infinite loop
    const deviceIdSetRef = useRef(false);

    useEffect(() => {
        if (isUndefined(deviceId) && !deviceIdSetRef.current) {
            deviceIdSetRef.current = true;
            gst.local.set("deviceId", v4());
        }
    }, [deviceId, gst]);

    const { accessToken, refreshToken, tokenExpiry, rememberMe, deviceOptions } = user ?? {};

    // ---------------------- circuit ----------------------

    const circuitRef = useRef({ openUntil: 0 });

    const isCircuitOpen = () => Date.now() < circuitRef.current.openUntil;

    const openCircuit = (ms = 10000) => {
        circuitRef.current.openUntil = Date.now() + ms;
    };

    // ---------------------- refs for current values ----------------------

    const valuesRef = useRef({
        user,
        accessToken,
        refreshToken,
        tokenExpiry,
        rememberMe,
        deviceOptions,
        deviceId,
        gst,
        debug,
        prefixUrl,
        onApiError
    });

    // Update ref on each render
    valuesRef.current = {
        user,
        accessToken,
        refreshToken,
        tokenExpiry,
        rememberMe,
        deviceOptions,
        deviceId,
        gst,
        debug,
        prefixUrl,
        onApiError
    };

    // ---------------------- refreshPromise ref ----------------------

    const refreshPromiseRef = useRef(null);

    // ---------------------- baseApi ----------------------

    const baseApi = useMemo(() => ky.create({
        prefixUrl,
        timeout,
        headers: {
            "X-DEVICEID": deviceId,
        },
        hooks: {
            beforeRequest: [
                (request, options) => {
                    const { method, url } = request;
                    const { delay } = options;
                    const { debug: currentDebug } = valuesRef.current;

                    if (isCircuitOpen()) {
                        if (currentDebug) {
                            log.apiError(`${method} - BLOCKED`, url);
                        }

                        return Promise.reject(new Error("Circuit breaker open – requests blocked"));
                    }

                    if (!navigatorInfo.isOnLine) {
                        if (currentDebug) {
                            log.apiError(`${method} - NO CONNECTION`, url);
                        }

                        openCircuit(5000);

                        return Promise.reject(new Error("No internet connection"));
                    }

                    if (currentDebug) {
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
                    const { debug: currentDebug } = valuesRef.current;

                    if (!ok) {
                        if (currentDebug) {
                            log.apiError(`${method} - ${status}`, url);
                        }
                    } else {
                        if (currentDebug) {
                            log.apiSuccess(`${method} - ${status}`, url);
                        }
                    }
                }
            ]
        }
    }), [prefixUrl, timeout, deviceId]);

    // ---------------------- refresh ----------------------

    const refresh = useMemo(() => () => {
        if (!refreshPromiseRef.current) {
            const { refreshToken: currentRefreshToken, rememberMe: currentRememberMe, user: currentUser, gst: currentGst } = valuesRef.current;

            refreshPromiseRef.current = baseApi
                .get("refresh", {
                    headers: {
                        Authorization: `Bearer ${currentRefreshToken}`
                    }
                })
                .json()
                .then((data) => {
                    const mappedData = refreshAccessTokenMap(data);

                    currentGst[currentRememberMe ? "local" : "session"].set("user", {
                        ...currentUser,
                        ...mappedData,
                        tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                    });
                })
                .catch((error) => {
                    currentGst.unset("user");
                    throw error;
                })
                .finally(() => refreshPromiseRef.current = null);
        }

        return refreshPromiseRef.current;
    }, [baseApi]);

    // ---------------------- publicApi ----------------------

    const publicApi = useMemo(() => baseApi.extend({}), [baseApi]);

    // ---------------------- entities ----------------------

    const entities = useMemo(() => (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi.get(options.url ?? "login", options).json();
    }, [publicApi]);

    // ---------------------- login ----------------------

    const login = useMemo(() => (body, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi
            .post(options.url ?? "login", {
                json: body,
                 ...options
            })
            .json()
            .then((data) => {
                const mappedData = loginMap(data);
                const { gst: currentGst } = valuesRef.current;

                const { rememberMe: loginRememberMe, expiresIn } = mappedData;

                currentGst[loginRememberMe ? "local" : "session"].set("user", {
                    ...mappedData,
                    tokenExpiry: floor(Date.now() / 1000) + expiresIn
                });

                return mappedData;
            });
    }, [publicApi]);

    // ---------------------- QR pairing (smartAuth) ----------------------
    //
    // claimQrPair: mobile claims a pairing_id displayed by the PC side.
    //   POST /qr-pair/{pairing_id}/claim  body: { device_label?, device_uuid? }
    //   200 -> { status: 'claimed', claim_token }
    //
    // pollQrPair: mobile polls until the PC user confirms in Dolibarr.
    //   POST /qr-pair/{pairing_id}/poll   body: { claim_token }
    //   200 -> one of:
    //     { status: 'pending'   }                 keep polling
    //     { status: 'cancelled' | 'expired' }     stop
    //     { status: 'consumed', access_token, refresh_token, expires_in,
    //       device_uuid }                         logged in
    // When status === 'consumed' we persist the user in local storage
    // (QR pairing is by design "this is a trusted device").

    const claimQrPair = useMemo(() => (pairingId, body = {}, options = {}) => {
        throwTypeError({ value: body, name: "body (param)", type: ["plain object"] });
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi
            .post(`qr-pair/${pairingId}/claim`, {
                json: body,
                ...options,
            })
            .json();
    }, [publicApi]);

    const pollQrPair = useMemo(() => (pairingId, claimToken, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi
            .post(`qr-pair/${pairingId}/poll`, {
                json: { claim_token: claimToken },
                ...options,
            })
            .json()
            .then((data) => {
                if (data?.status === "consumed" && data?.access_token) {
                    const { gst: currentGst } = valuesRef.current;
                    const expiresIn = data.expires_in ?? 0;

                    currentGst.local.set("user", {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        expiresIn,
                        deviceUuid: data.device_uuid,
                        tokenExpiry: floor(Date.now() / 1000) + expiresIn,
                    });
                }

                return data;
            });
    }, [publicApi]);

    // ---------------------- privateApi ----------------------

    const privateApi = useMemo(() => {
        const api = baseApi.extend({
            hooks: {
                beforeRequest: [
                    async (request, options, state) => {
                        const { accessToken: currentAccessToken, tokenExpiry: currentTokenExpiry, deviceId: currentDeviceId } = valuesRef.current;

                        state.hasRefreshed = state.hasRefreshed ?? false;

                        if (floor(Date.now() / 1000) > currentTokenExpiry) {
                            if (state.hasRefreshed) {
                                throw new Error("Token refresh already attempted");
                            }

                            state.hasRefreshed = true;
                            await refresh();
                        }

                        request.headers.set("Authorization", `Bearer ${currentAccessToken}`);
                        request.headers.set("X-DEVICEID", currentDeviceId);
                    }
                ],
                afterResponse: [
                    async (request, options, response) => {
                        const { status } = response;
                        const { gst: currentGst, prefixUrl: currentPrefixUrl } = valuesRef.current;

                        if (status === 401) {
                            const state = options.context ?? {};
                            state.hasRetried = state.hasRetried ?? false;

                            if (state.hasRetried) {
                                openCircuit(30000);
                                currentGst.unset("user");
                                throw new Error("Unauthorized after refresh");
                            }

                            state.hasRetried = true;
                            try {
                                await refresh();

                                return api(replace(request.url, currentPrefixUrl, ""), {
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
                ],
                beforeError: [
                    async (error) => {
                        // Extract API error message from response body before ky throws
                        if (error.response) {
                            try {
                                const body = await error.response.clone().json();
                                error.apiMessage = body?.error || body?.message;
                            } catch {
                                // Response may not be JSON
                            }
                        }
                        return error;
                    }
                ]
            }
        });
        return api;
    }, [baseApi, refresh]);

    // ---------------------- logout ----------------------

    const logout = useMemo(() => (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? "logout", options)
            .json()
            .then(() => {
                const { gst: currentGst } = valuesRef.current;
                currentGst.unset("user");
            })
            .catch((error) => {
                throw error;
            });
    }, [privateApi]);

    // ---------------------- device ----------------------

    const device = useMemo(() => (body, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        const { label, uuid } = body;
        const { deviceOptions: currentDeviceOptions, deviceId: currentDeviceId, rememberMe: currentRememberMe, user: currentUser, gst: currentGst } = valuesRef.current;

        const noUuid = (uuid === "noDevice" || isEmpty(currentDeviceOptions));

        return privateApi
            .post(options.url ?? "device", {
                json: { label: label || undefined, uuid: noUuid ? currentDeviceId : uuid },
            })
            .json()
            .then((data) => {
                const mappedData = refreshAccessTokenMap(data);

                // Remove deviceOptions after successful device identification
                const { deviceOptions: _, ...userWithoutDeviceOptions } = currentUser;

                currentGst[currentRememberMe ? "local" : "session"].set("user",  {
                        ...userWithoutDeviceOptions,
                        ...mappedData,
                        tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                });

                if (!noUuid) {
                    currentGst.local.set("deviceId", uuid);
                }

                return mappedData;
            });
    }, [privateApi]);

    // ---------------------- stable API methods ----------------------

    // Helper to handle raw vs json response based on options
    // raw is for pictures for example or all binary data
    const handleResponse = (response, options) => {
        if (options?.raw) {
            return response;
        }
        return response.json();
    };

    // Helper to create API method with error handling and global error callback
    // Pass { silent: true } in options to suppress the automatic error notification
    const createApiMethod = (method) => async (url, options) => {
        const { silent, ...kyOptions } = options ?? {};
        const { debug: currentDebug, onApiError: errorCallback } = valuesRef.current;
        try {
            const response = await privateApi[method](url, kyOptions);
            const data = await handleResponse(response, kyOptions);

            // Defensive: check for application-level errors in response body (HTTP 200 with error field)
            if (!silent && !kyOptions?.raw && data && typeof data === "object" && data.error && errorCallback) {
                errorCallback(data.error);
            }

            return data;
        } catch (error) {
            if (currentDebug) {
                log.apiError(`${method.toUpperCase()} failed`, url, error.message);
            }

            // Enrich error with context
            error.url = url;
            error.method = method.toUpperCase();

            // Call error callback for API errors unless silenced
            // apiMessage is set by the beforeError hook in privateApi
            if (!silent && error.apiMessage && errorCallback) {
                errorCallback(error.apiMessage);
            }

            throw error;
        }
    };

    const get = useMemo(() => createApiMethod('get'), [privateApi]);

    const post = useMemo(() => createApiMethod('post'), [privateApi]);

    const put = useMemo(() => createApiMethod('put'), [privateApi]);

    const patch = useMemo(() => createApiMethod('patch'), [privateApi]);

    const del = useMemo(() => createApiMethod('delete'), [privateApi]);

    // ---------------------- return ----------------------

    return useMemo(() => ({
        user,
        entities,
        getEntities: entities,
        login,
        logout,
        device,
        identifyDevice: device,
        claimQrPair,
        pollQrPair,
        public: publicApi,
        private: privateApi,
        get,
        post,
        put,
        patch,
        del,
    }), [user, entities, login, logout, device, claimQrPair, pollQrPair, publicApi, privateApi, get, post, put, patch, del]);
};
