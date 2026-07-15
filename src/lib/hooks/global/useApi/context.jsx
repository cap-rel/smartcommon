import ky from "ky";
import { floor, isEmpty, isUndefined } from "lodash";
import { v4 } from "uuid";
import { useMemo, useRef, useEffect } from "react";

import { log, navigatorInfo, throwTypeError } from "lib/utils";
import { useGlobalStates, useLibConfig } from "lib/hooks";
import { loginMap } from "lib/hooks/useApiTest2/useLogin";
import { refreshAccessTokenMap } from "lib/hooks/useApiTest2/useRefreshAccessToken";

export const useApiContext = () => {
    const libConfig = useLibConfig();

    const { debug: libDebug, api } = libConfig;

    const { prefixUrl, timeout, debug: apiDebug, onApiError, onLoginPersist, onSessionExpired } = api ?? {};

    const debug = isUndefined(apiDebug) ? libDebug : apiDebug;

    // SECURITY -- token storage posture (accepted risk).
    // The authenticated user (incl. access + refresh JWT) is persisted via gst
    // into localStorage (rememberMe) or sessionStorage. Both are readable by any
    // JS on the origin, so a future XSS could exfiltrate the tokens. This is a
    // deliberate, accepted trade-off for an offline-first PWA that authenticates
    // a REST API with a Bearer header (immune to CSRF, survives reload/offline).
    // The real hardening is NOT a sessionStorage swap (that breaks rememberMe
    // and offline for no gain against an active XSS): it is (1) moving the
    // refresh token to an httpOnly;Secure;SameSite cookie on the smartAuth
    // backend, (2) a short access-token TTL, and (3) a strict CSP in the
    // consumer apps. Tracked as a separate cross-repo hardening task.

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

    const circuitRef = useRef({ openUntil: 0, offline: false });

    const isCircuitOpen = () => {
        if (Date.now() >= circuitRef.current.openUntil) {
            return false;
        }
        // A breaker that was tripped only because we were offline must not keep
        // blocking once connectivity is back: the queued drains that fire on
        // 'online' would otherwise all reject with "Circuit breaker open" and
        // strand the offline work. Server/auth-driven trips (offline=false)
        // still block for their full cooldown.
        if (circuitRef.current.offline && navigatorInfo.isOnLine === true) {
            return false;
        }
        return true;
    };

    // `offline` tags a breaker opened only because connectivity was lost. Such a
    // breaker MUST stop blocking the moment we are back online (see isCircuitOpen),
    // otherwise queued work (offline submit queue, inventory cascade) never flushes
    // on reconnect -- the breaker keeps re-opening on every drain attempt because
    // navigatorInfo lags. Server/auth-driven openings (5xx, dead session) leave
    // `offline` false so their throttle is honoured even while online.
    const openCircuit = (ms = 10000, offline = false) => {
        circuitRef.current.openUntil = Date.now() + ms;
        circuitRef.current.offline = !!offline;
    };

    // Stable (useMemo []) so it keeps the same identity across renders and can
    // be exposed on the api object without busting its memo. Immediately closes
    // the breaker: used on reconnection and as the consumer-facing escape hatch.
    const resetCircuit = useMemo(() => () => {
        circuitRef.current.openUntil = 0;
    }, []);

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
        onLoginPersist,
        onSessionExpired
    };

    // ---------------------- refreshPromise ref ----------------------

    const refreshPromiseRef = useRef(null);

    // Synchronous mirror of the most recently issued refresh token. `valuesRef`
    // is refreshed on RENDER, so it lags one render behind the gst.set() that a
    // refresh() / login() performs. Without this ref, a refresh triggered in that
    // gap (e.g. a second in-flight 401 after the first refresh already resolved and
    // cleared refreshPromiseRef) would read the STALE, already-consumed refresh
    // token from valuesRef and replay it -- which smartauth treats as an attack and
    // revokes the ENTIRE token family, killing the session. Kept in sync in
    // login()/refresh() success and cleared on logout/session death.
    const latestRefreshTokenRef = useRef(null);

    // ---------------------- dead-session latch ----------------------

    // Guards the eject-to-login so it fires exactly ONCE per dead session,
    // before the flood of parallel in-flight requests each surface their own
    // error toast. Reset on the next successful response and on a fresh login.
    const sessionDeadRef = useRef(false);

    // Single-shot eject to /login for a PROVEN-dead session. Latched by
    // sessionDeadRef so the flood of parallel in-flight 401s ejects exactly
    // once: one circuit open, one user unset, one onSessionExpired
    // notification. Both the afterResponse 401 path and createApiMethod's
    // catch funnel through here so the eject can never double-fire.
    const ejectDeadSession = () => {
        if (sessionDeadRef.current) {
            return;
        }
        sessionDeadRef.current = true;
        latestRefreshTokenRef.current = null;
        const { gst: currentGst, onSessionExpired: sessionExpiredCallback } = valuesRef.current;
        openCircuit(30000);
        currentGst.unset("user"); // RouteGuard redirects to /login
        if (sessionExpiredCallback) {
            sessionExpiredCallback();
        }
    };

    // ---------------------- reconnection: reset circuit ----------------------

    // When a request is fired offline, beforeRequest opens the breaker for 5s
    // and rejects. The breaker then stays open until that cooldown elapses -
    // including right after the browser comes back online. Any drain that the
    // consumer triggers on the 'online' event (or via mustSync) would hit
    // "Circuit breaker open - requests blocked", burn its attempts, and nothing
    // would relaunch the drain once the breaker finally closes -> the offline
    // submission queue never flushes on reconnection (verified by
    // smartInterventions E2E 84-offline-intervention-submit-queue).
    //
    // Fix: on 'online', immediately clear the breaker so queued requests fire at
    // once instead of waiting the cooldown. We do NOT clear it for a known-dead
    // session: that 30s circuit is intentional throttling and the session stays
    // invalid until re-login (see the dead-session handling in createApiMethod).
    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        const handleOnline = () => {
            if (sessionDeadRef.current) {
                if (valuesRef.current.debug) {
                    log.apiError("ONLINE - circuit kept (dead session)", "");
                }
                return;
            }
            resetCircuit();
            if (valuesRef.current.debug) {
                log.apiSuccess("ONLINE - circuit reset", "");
            }
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [resetCircuit]);

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

                        return Promise.reject(new Error("Circuit breaker open - requests blocked"));
                    }

                    if (!navigatorInfo.isOnLine) {
                        if (currentDebug) {
                            log.apiError(`${method} - NO CONNECTION`, url);
                        }

                        openCircuit(5000, true);

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
                            // Prefer an explicit machine code field when the backend
                            // sends one; fall back to body.error (smartAuth sometimes
                            // puts a code string there, e.g. "pairing_not_claimable").
                            error.apiCode = body?.code ?? body?.error;
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
            const { rememberMe: currentRememberMe, user: currentUser, gst: currentGst } = valuesRef.current;
            // Prefer the synchronously-tracked latest refresh token over valuesRef
            // (which lags one render): using the stale one here replays an already
            // consumed token and gets the whole family revoked. See latestRefreshTokenRef.
            const currentRefreshToken = latestRefreshTokenRef.current ?? valuesRef.current.refreshToken;

            refreshPromiseRef.current = baseApi
                .get("refresh", {
                    headers: {
                        Authorization: `Bearer ${currentRefreshToken}`
                    }
                })
                .json()
                .then((data) => {
                    const mappedData = refreshAccessTokenMap(data);
                    // Record the rotated refresh token synchronously so a follow-up
                    // refresh (before the gst.set below propagates to valuesRef) uses
                    // the new token, not the just-consumed one.
                    if (mappedData.refreshToken) {
                        latestRefreshTokenRef.current = mappedData.refreshToken;
                    }

                    currentGst[currentRememberMe ? "local" : "session"].set("user", {
                        ...currentUser,
                        ...mappedData,
                        tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                    });
                })
                .catch((error) => {
                    latestRefreshTokenRef.current = null;
                    currentGst.unset("user");
                    throw error;
                })
                .finally(() => refreshPromiseRef.current = null);
        }

        return refreshPromiseRef.current;
    }, [baseApi]);

    // ---------------------- publicApi ----------------------

    const publicApi = useMemo(() => baseApi.extend({}), [baseApi]);

    // Public counterpart of createApiMethod: wraps a public endpoint call in
    // the same try/catch + error enrichment so a non-JSON 2xx body (e.g. a
    // Dolibarr HTML access page) surfaces as a readable error instead of a raw
    // "Unexpected token < in JSON" SyntaxError. No dead-session eject: public
    // endpoints have no session to kill. Keeps the exact .METHOD(url).json()
    // chain so existing call sites and their mocks are unaffected.
    const callPublic = async (method, url, options = {}) => {
        const { debug: currentDebug } = valuesRef.current;
        try {
            return await publicApi[method](url, options).json();
        } catch (error) {
            if (currentDebug) {
                log.apiError(`${method.toUpperCase()} (public) failed`, url, error.message);
            }
            error.url = url;
            error.method = method.toUpperCase();
            // A non-JSON body throws a SyntaxError with no error.response (so
            // the beforeError hook never set apiMessage). Give consumers a
            // readable message instead of the raw parser error.
            if (error instanceof SyntaxError && !error.apiMessage) {
                error.apiMessage = "Unexpected non-JSON response from server";
            }
            throw error;
        }
    };

    // ---------------------- entities ----------------------

    const entities = useMemo(() => (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return callPublic("get", options.url ?? "login", options);
    }, [publicApi]);

    // ---------------------- login ----------------------

    const login = useMemo(() => (body, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        // A fresh login attempt must never be blocked by a circuit opened
        // during the previous session's eject (the 30s circuit is otherwise
        // only released by time). Also clear the dead-session latch.
        circuitRef.current.openUntil = 0;
        sessionDeadRef.current = false;

        return callPublic("post", options.url ?? "login", {
                json: body,
                ...options
            })
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

                // Seed the synchronous refresh-token mirror with this fresh
                // session's token (and drop any leftover from a previous session)
                // so the first post-login refresh does not read a stale valuesRef.
                latestRefreshTokenRef.current = mappedData.refreshToken ?? null;

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

        return callPublic("post", `qr-pair/${pairingId}/claim`, {
                json: body,
                ...options,
            });
    }, [publicApi]);

    const pollQrPair = useMemo(() => (pairingId, claimToken, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return callPublic("post", `qr-pair/${pairingId}/poll`, {
                json: { claim_token: claimToken },
                ...options,
            })
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

                    // Seed the synchronous refresh-token mirror (same rationale
                    // as login/refresh/device): QR pairing issues a fresh token
                    // pair directly here, so a follow-up refresh in the render
                    // gap must present this token, not a stale valuesRef one.
                    latestRefreshTokenRef.current = data.refresh_token ?? null;

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
                    async (request, options) => {
                        const { accessToken: currentAccessToken, tokenExpiry: currentTokenExpiry, deviceId: currentDeviceId } = valuesRef.current;

                        // Proactively refresh an expired access token before the
                        // request leaves. refresh() dedupes concurrent callers via
                        // refreshPromiseRef (N parallel requests share ONE /refresh),
                        // and options.context guards a ky retry from re-triggering it.
                        // ky 1.x passes no mutable per-request "state" 3rd arg to
                        // beforeRequest; options.context is the supported channel,
                        // same as the 401 path in afterResponse below.
                        const ctx = options.context ?? {};
                        if (floor(Date.now() / 1000) > currentTokenExpiry && !ctx.refreshedOnExpiry) {
                            ctx.refreshedOnExpiry = true;
                            await refresh();
                        }

                        request.headers.set("Authorization", `Bearer ${currentAccessToken}`);
                        request.headers.set("X-DEVICEID", currentDeviceId);
                    }
                ],
                afterResponse: [
                    async (request, options, response) => {
                        const { status } = response;
                        const { prefixUrl: currentPrefixUrl } = valuesRef.current;

                        if (status === 401) {
                            const state = options.context ?? {};
                            state.hasRetried = state.hasRetried ?? false;

                            if (state.hasRetried) {
                                ejectDeadSession();
                                throw new Error("Unauthorized after refresh");
                            }

                            state.hasRetried = true;
                            try {
                                await refresh();

                                // Rebuild the relative route from the request
                                // PATH, not by string-replacing the prefix on the
                                // absolute request.url. request.url is absolute
                                // (origin + path); currentPrefixUrl may be relative
                                // ("/api.php/") or absolute. A naive replace() on a
                                // relative prefix strips the segment from the MIDDLE
                                // of the absolute URL, gluing the origin to the route
                                // (".../api.php/https:/host..route") -- which the
                                // backend then rejects as injection. Stripping the
                                // prefix off the pathname keeps it correct in both
                                // cases; ky re-adds prefixUrl on the retry.
                                const reqUrl = new URL(request.url);
                                const prefixPath = new URL(currentPrefixUrl, reqUrl.origin).pathname;
                                const relative = (reqUrl.pathname.startsWith(prefixPath)
                                    ? reqUrl.pathname.slice(prefixPath.length)
                                    : reqUrl.pathname.replace(/^\/+/, "")) + reqUrl.search;

                                return api(relative, {
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

        // The client-side logout must ALWAYS succeed: clearing the local user
        // is what actually logs the user out of the PWA. A server that is
        // unreachable (offline) or that errors must not leave the user
        // authenticated locally. We therefore unset in finally and swallow the
        // network/parse error (logged), so the caller can always navigate to
        // /login.
        return privateApi
            .post(options.url ?? "logout", options)
            .json()
            .catch((error) => {
                log.apiError(
                    "POST logout - network/parse error (logging out locally anyway)",
                    options.url ?? "logout",
                    error?.message
                );
            })
            .finally(() => {
                const { gst: currentGst } = valuesRef.current;
                latestRefreshTokenRef.current = null;
                currentGst.unset("user");
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

                // Device identification can rotate the token family (the
                // "picked another device" branch issues a fresh pair): keep the
                // synchronous refresh-token mirror in sync so a follow-up refresh
                // does not replay the old token.
                if (mappedData.refreshToken) {
                    latestRefreshTokenRef.current = mappedData.refreshToken;
                }

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
        // 204 No Content / 205 Reset Content carry no body: calling
        // response.json() on them throws "Unexpected end of JSON input".
        // Same for any 2xx the backend explicitly sends empty.
        if (response.status === 204 || response.status === 205) {
            return null;
        }
        if (response.headers?.get?.("content-length") === "0") {
            return null;
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

            // A successful response means the session is alive again: release
            // the latch so a future expiry can re-trigger the single eject.
            sessionDeadRef.current = false;

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

            // Detect a dead session and eject to login on the FIRST failure,
            // before the flood of parallel in-flight requests each surface
            // their own toast. A session is only PROVEN dead by a server that
            // actually answered with:
            //   - a 401 Unauthorized (no/expired/invalid token), or
            //   - a body that is not the JSON we expected: backends serve a
            //     plain-text/HTML access page on an expired session, so
            //     response.json() throws a SyntaxError ("... is not valid
            //     JSON") / "Unauthorized".
            //
            // A 403 Forbidden is NOT a dead session: the caller is correctly
            // authenticated but lacks the right on THIS resource. Ejecting on
            // 403 logged the whole app out on a single permission denial. We
            // let the 403 surface as a normal error so consumers can toast
            // "access denied" without losing the session.
            //
            // Crucially, a CONNECTIVITY failure must never be read as a dead
            // session: when offline, beforeRequest rejects with "No internet
            // connection" and opens the circuit, so follow-up requests reject
            // with "Circuit breaker open". Ejecting to /login on those would
            // defeat offline-capable PWAs that read their data from IndexedDB.
            // So we gate the positive signals on navigator.onLine, and we treat
            // "Circuit breaker open" only as downstream NOISE of an ALREADY
            // known-dead session (to keep its toast silent), never as a trigger.
            const status = error.response?.status;
            const message = error.message ?? "";
            const isOffline = navigatorInfo.isOnLine === false;
            const isConfirmedDeadSession =
                !isOffline && (
                    status === 401 ||
                    error instanceof SyntaxError ||
                    /is not valid JSON|Unexpected token|Unauthorized/i.test(message)
                );
            const isDeadSessionDownstream =
                sessionDeadRef.current && /Circuit breaker open/i.test(message);

            if (isConfirmedDeadSession || isDeadSessionDownstream) {
                // Tag EVERY dead-session error so consumers can skip their own
                // per-request toast (the flood) and let the single
                // onSessionExpired notification speak instead.
                error.sessionExpired = true;
            }

            if (isConfirmedDeadSession) {
                ejectDeadSession(); // latched: fires once for the whole 401 flood
            }

            // Call error callback for API errors unless silenced. A dead
            // session is reported once via onSessionExpired above, never via
            // per-request onApiError -- that is the toast flood we are killing.
            // apiMessage is set by the beforeError hook in privateApi.
            if (!silent && !error.sessionExpired && error.apiMessage && errorCallback) {
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
        resetCircuit,
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
        resetCircuit,
    ]);
};
