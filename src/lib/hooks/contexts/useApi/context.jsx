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

    const deviceId = gst.get("deviceId");

    if (isUndefined(deviceId)) {
        gst.local.set("deviceId", v4());
    }

    const { accessToken, refreshToken, tokenExpiry, rememberMe } = gst.get("user") ?? {};
    const storage = rememberMe ? "local" : "session";

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

                    if (!navigatorInfo.isOnLine) {
                        log.apiError(`${method} - NO CONNECTION`, `${prefixUrl}${url}`);

                        return Promise.reject(new Error("No internet connection"));
                    }

                    
                    log.apiLoading(`${method}`, `${prefixUrl}${url}`);
                }
            ],
            afterResponse: [
                (request, options, response) => {
                    const { method, url } = request;
                    const { ok, status } = response;

                    if (!ok) {
                        log.apiError(`${method} - ${status}`, `${prefixUrl}${url}`);
                    } else {
                        log.apiSuccess(`${method} - ${status}`, `${prefixUrl}${url}`);
                    }
                }
            ]
        }
    });

    // ---------------------- refresh ----------------------

    const refresh = () => {
        return baseApi
            .get("/refresh", {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }
            })
            .json()
            .then((data) => {
                const mappedData = refreshAccessTokenMap(data);

                gst[storage].set("user", (prevUser) => ({
                    ...prevUser,
                    ...mappedData,
                    tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                }));
            })
            .catch(() => {
                gst.unset("user");
            })
    };

    // ---------------------- publicApi ----------------------

    const publicApi = baseApi.extend({});

    // ---------------------- entities ----------------------

    const entities = (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi.get(options.url ?? "/login", options).json();
    };

    // ---------------------- login ----------------------

    const login = (data, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return publicApi
            .post(options.url ?? "/login", {
                json: data,
                 ...options
            })
            .json()
            .then((data) => {
                const mappedData = loginMap(data);

                gst[storage].set("user", { 
                    ...mappedData,
                    tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn 
                });
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
                    const { ok, status } = response;

                    if (!ok && status === 401) {
                        try {
                            await refresh();

                            return privateApi(request.url.replace(prefixUrl, ""), options);
                        } catch (error) {
                            return response;
                        }
                    }
                }
            ]
        }
    });

    // ---------------------- logout ----------------------

    const logout = (options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? "/logout", options)
            .json()
            .then(() => {
                gst.unset("user");
            });
    };

    // ---------------------- device ----------------------

    const device = (data, options = {}) => {
        throwTypeError({ value: options, name: "options (param)", type: ["plain object"] });

        return privateApi
            .post(options.url ?? "/device", {
                json: data,
                ...options
            })
            .json()
            .then((data) => {
                const mappedData = refreshAccessTokenMap(data);

                gst[storage].set("user", {
                    ...mappedData,
                    tokenExpiry: floor(Date.now() / 1000) + mappedData.expiresIn
                });
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