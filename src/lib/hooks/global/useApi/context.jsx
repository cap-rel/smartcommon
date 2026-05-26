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

    const { prefixUrl, timeout, debug: apiDebug, onApiError, onLoginPersist } = api ?? {};

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
        onApiError,
        onLoginPersist
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
        onApiError,
        onLoginPersist
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
            ],
            beforeError: [
                async (error) => {
                    // Extract API error message + code from response body before
                    // ky throws. Applies to ALL extended apis (public + private)
                    // so that consumers like the QR pair flow can read
                    // error.apiMessage and error.apiCode.
                    if (error.response) {
                        try {
                            const body = await error.response.clone().json();
                            error.apiMessage = body?.error || body?.message;
                            error.apiCode = body?.error;
                        } catch {
                            // Response may not be JSON, leave the fields undefined.
                        }
                    }
                    return error;
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
            .then(async (data) => {
                const mappedData = loginMap(data);
                const {
                    gst: currentGst,
                    onLoginPersist: currentOnLoginPersist,
                } = valuesRef.current;

                // Source of truth for `rememberMe` is the request body we
                // just sent. The smartAuth backend does not echo it back in
                // the login response, so reading it from `mappedData` (which
                // comes from `loginMap(data)` = the response) would always
                // be undefined and silently demote the auth to sessionStorage
                // even when the user opted into persistence.
                const effectiveRememberMe = body?.rememberMe === true;
                const { expiresIn } = mappedData;

                if (!effectiveRememberMe) {
                    log.info(
                        `[useApi.login] persisting user in sessionStorage ` +
                        `(rememberMe=${body?.rememberMe ?? "undefined"})`
                    );
                }

                // smartAuth >=2.1 may send `needs_device_pick` + the
                // user's existing logical user-devices (the "mon iPhone"
                // logical entries). `loginMap` does not rename these keys
                // (passthrough), so we surface camelCase aliases here for
                // consumers (LoginComponent reads `needsDevicePick`).
                // The tokens are valid as-is: we persist them right away
                // so the post-login UX (the picker, hitting the JWT-
                // protected /account/user-devices endpoint) works.
                const needsDevicePick = data?.needs_device_pick === true;
                const existingUserDevices = Array.isArray(data?.existing_user_devices)
                    ? data.existing_user_devices
                    : [];

                const baseUser = {
                    ...mappedData,
                    rememberMe: effectiveRememberMe,
                    tokenExpiry: floor(Date.now() / 1000) + expiresIn,
                    needsDevicePick,
                    existingUserDevices,
                };

                // Optional consumer-provided enrichment hook. Lets the
                // app merge settings/config (from IndexedDB or any
                // async source) into the user BEFORE it is committed
                // to gst, so RouteGuard cannot redirect to a protected
                // route that destructures `user.settings.X` before the
                // consumer has had the chance to populate it.
                let enrichedUser = baseUser;
                if (typeof currentOnLoginPersist === "function") {
                    try {
                        const result = await currentOnLoginPersist(baseUser);
                        if (result && typeof result === "object") {
                            // Spread result over baseUser so the
                            // consumer can override fields, but auth
                            // fields (tokenExpiry, rememberMe) are
                            // preserved if the callback returns a
                            // partial object.
                            enrichedUser = { ...baseUser, ...result };
                        }
                    } catch (err) {
                        log.error(
                            "[useApi.login] onLoginPersist threw, falling " +
                            "back to the minimal user",
                            err
                        );
                    }
                }

                currentGst[effectiveRememberMe ? "local" : "session"].set(
                    "user",
                    enrichedUser
                );

                return {
                    ...mappedData,
                    needsDevicePick,
                    existingUserDevices,
                };
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

                    // Mirror loginMap: surface devices_choice as deviceOptions
                    // so the consumer's RouteGuard routes the user through
                    // the same device-naming/selection page as /login does.
                    // rememberMe: true is required so the subsequent
                    // identifyDevice() call (which reads currentRememberMe
                    // from this user) keeps the persistence on local
                    // storage instead of silently demoting to session
                    // storage. QR pairing = trusted device by design
                    // (see comment block at the top of this section).
                    currentGst.local.set("user", {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        expiresIn,
                        deviceUuid: data.device_uuid,
                        deviceOptions: data.devices_choice,
                        rememberMe: true,
                        tokenExpiry: floor(Date.now() / 1000) + expiresIn,
                    });

                    // Echo the camelCase aliases on the resolved value too,
                    // so consumer onSuccess({ ...data }) handlers that
                    // hydrate a Redux store see id / username / deviceOptions
                    // exactly like loginMap returns for /login.
                    return {
                        ...data,
                        id: data.userid,
                        username: data.user,
                        deviceOptions: data.devices_choice,
                    };
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
                // beforeError is now defined on baseApi above so it applies
                // to public + private alike (needed for QR pair flow).
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

        const { label, uuid, viewport_mode: viewportMode } = body;
        const { deviceOptions: currentDeviceOptions, deviceId: currentDeviceId, rememberMe: currentRememberMe, user: currentUser, gst: currentGst } = valuesRef.current;

        const noUuid = (uuid === "noDevice" || isEmpty(currentDeviceOptions));

        // viewport_mode is only sent when explicitly provided. Omitting
        // the field on the backend signals "do not touch the stored
        // viewport_mode" (preserves a previously-chosen value), while
        // sending an empty string would clear it. We forward an explicit
        // string (including "auto") and drop falsy/undefined values.
        const jsonBody = { label: label || undefined, uuid: noUuid ? currentDeviceId : uuid };
        if (typeof viewportMode === "string" && viewportMode !== "") {
            jsonBody.viewport_mode = viewportMode;
        }

        return privateApi
            .post(options.url ?? "device", {
                json: jsonBody,
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

    // ---------------------- user devices (logical, smartAuth) ----------------------
    //
    // A "user-device" is the logical entity ("mon iPhone") shared by all
    // PWAs installed on the same physical device for the same user. The
    // smartAuth backend exposes 5 endpoints; we mirror them here.
    //
    // After a successful create/link, we clear the `needsDevicePick`
    // flag stashed by the login flow so subsequent reads of the user
    // state from RouteGuard / consumers see a fully-resolved auth.

    const clearNeedsDevicePick = () => {
        const { user: currentUser, rememberMe: currentRememberMe, gst: currentGst } = valuesRef.current;
        if (!currentUser) return;
        const updated = { ...currentUser, needsDevicePick: false, existingUserDevices: [] };
        currentGst[currentRememberMe ? "local" : "session"].set("user", updated);
    };

    const listUserDevices = useMemo(() => (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .get(options.url ?? "account/user-devices", options)
            .json();
    }, [privateApi]);

    const createUserDevice = useMemo(() => (body, options = {}) => {
        throwTypeError({ value: body, name: "body (param)", type: ["plain object"] });
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? "account/user-devices", {
                json: body,
                ...options,
            })
            .json()
            .then((data) => {
                clearNeedsDevicePick();
                return data;
            });
    }, [privateApi]);

    const linkUserDevice = useMemo(() => (id, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? `account/user-devices/${id}/link`, options)
            .json()
            .then((data) => {
                clearNeedsDevicePick();
                return data;
            });
    }, [privateApi]);

    const renameUserDevice = useMemo(() => (id, label, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? `account/user-devices/${id}/rename`, {
                json: { label },
                ...options,
            })
            .json();
    }, [privateApi]);

    const deleteUserDevice = useMemo(() => (id, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .delete(options.url ?? `account/user-devices/${id}`, options)
            .json();
    }, [privateApi]);

    // Persist a viewport_mode choice on a logical user_device. Lower-
    // level helper: the caller is responsible for knowing which
    // user_device id to target (typically by listing first, since the
    // login response does not surface a "current device id"). Sending
    // null clears the column back to NULL on the backend.
    const setDeviceViewportMode = useMemo(() => (id, viewportMode, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? `account/user-devices/${id}/viewport-mode`, {
                json: { viewport_mode: viewportMode ?? null },
                ...options,
            })
            .json();
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
        listUserDevices,
        createUserDevice,
        linkUserDevice,
        renameUserDevice,
        deleteUserDevice,
        setDeviceViewportMode,
        public: publicApi,
        private: privateApi,
        get,
        post,
        put,
        patch,
        del,
    }), [
        user,
        entities,
        login,
        logout,
        device,
        claimQrPair,
        pollQrPair,
        listUserDevices,
        createUserDevice,
        linkUserDevice,
        renameUserDevice,
        deleteUserDevice,
        setDeviceViewportMode,
        publicApi,
        privateApi,
        get,
        post,
        put,
        patch,
        del,
    ]);
};
