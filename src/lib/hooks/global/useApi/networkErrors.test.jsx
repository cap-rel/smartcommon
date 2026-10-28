/**
 * Network error recording for the feedback report (review point 9).
 *
 * ky only runs its beforeError hooks for HTTPError, which always carries a
 * response. Network-level failures (connection cut, timeout, CORS, the
 * offline/circuit rejections from beforeRequest) never pass through
 * beforeError: they are recorded in the createApiMethod catch instead, with
 * status 0. HTTP errors keep being recorded once, by the afterResponse hook.
 *
 * Same faithful ky mock as circuitBreaker.test.jsx: the registered
 * beforeRequest / afterResponse hooks really run, so the recording logic in
 * context.jsx is exercised end to end.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const { kyCtrl, gstState, libConfigState } = vi.hoisted(() => ({
    kyCtrl: {
        responder: () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    },
    gstState: {
        local: { set: vi.fn() },
        session: { set: vi.fn() },
        unset: vi.fn(),
        values: { user: undefined, deviceId: "11111111-2222-4333-8444-555555555555" },
    },
    libConfigState: {
        api: { prefixUrl: "https://example.com/", timeout: 5000 },
    },
}));

vi.mock("ky", () => {
    const buildInstance = (beforeHooks, afterHooks = []) => {
        const run = (method, url, options = {}) => {
            const responsePromise = (async () => {
                const request = {
                    method: method.toUpperCase(),
                    url: (libConfigState.api.prefixUrl ?? "") + url,
                    headers: { set: () => {} },
                };
                const state = {};
                for (const hook of beforeHooks) {
                    await hook(request, { ...options }, state);
                }
                const response = await kyCtrl.responder(method, url, options);
                for (const hook of afterHooks) {
                    await hook(request, { ...options }, response);
                }
                if (response && response.ok === false) {
                    throw Object.assign(new Error(`Request failed with status code ${response.status}`), {
                        name: "HTTPError",
                        response,
                    });
                }
                return response;
            })();
            responsePromise.json = async () => {
                const response = await responsePromise;
                return response.json();
            };
            return responsePromise;
        };
        const inst = (url, options) => run("get", url, options);
        for (const m of ["get", "post", "put", "patch", "delete"]) {
            inst[m] = (url, options) => run(m, url, options);
        }
        inst.extend = (config) =>
            buildInstance(
                [...beforeHooks, ...(config?.hooks?.beforeRequest ?? [])],
                [...afterHooks, ...(config?.hooks?.afterResponse ?? [])],
            );
        return inst;
    };
    return {
        default: {
            create: (config) => buildInstance(
                [...(config?.hooks?.beforeRequest ?? [])],
                [...(config?.hooks?.afterResponse ?? [])],
            ),
        },
    };
});

vi.mock("lib/hooks", () => ({
    useGlobalStates: () => gstState,
    useLibConfig: () => libConfigState,
}));

vi.mock("lib/hooks/useApiTest2/useLogin", () => ({ loginMap: (data) => data }));
vi.mock("lib/hooks/useApiTest2/useRefreshAccessToken", () => ({
    refreshAccessTokenMap: (data) => data,
}));

import { navigatorInfo, getRecentNetworkErrors, setNetworkErrorBufferEnabled } from "lib/utils";
import { useApiContext } from "./context";

const success = () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });
const serverError = () => ({ ok: false, status: 500, json: async () => ({ error: "boom" }) });

beforeEach(() => {
    kyCtrl.responder = success;
    gstState.unset.mockReset();
    gstState.local.set.mockReset();
    gstState.values.user = undefined;
    libConfigState.api = { prefixUrl: "https://example.com/", timeout: 5000 };
    navigatorInfo.isOnLine = true;
    // Drain the ring buffer between tests.
    setNetworkErrorBufferEnabled(false);
    setNetworkErrorBufferEnabled(true);
});

describe("network error recording for the feedback report", () => {
    it("records a network-level failure (no response) with status 0", async () => {
        kyCtrl.responder = () => {
            // Like a fetch() rejection: a plain error, no response attached.
            throw new TypeError("fetch failed");
        };

        const { result } = renderHook(() => useApiContext());
        await expect(result.current.get("x")).rejects.toThrow(/fetch failed/);

        const errors = getRecentNetworkErrors();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ method: "GET", status: 0 });
        expect(errors[0].at).toBeTruthy();
    });

    it("strips the query string from a network-level failure URL", async () => {
        kyCtrl.responder = () => {
            throw new TypeError("fetch failed");
        };

        const { result } = renderHook(() => useApiContext());
        await expect(result.current.get("x?token=abc123")).rejects.toThrow();

        const errors = getRecentNetworkErrors();
        expect(errors).toHaveLength(1);
        expect(errors[0].url).not.toContain("token");
        expect(errors[0].url).not.toContain("abc123");
    });

    it("records the offline beforeRequest rejection with status 0", async () => {
        navigatorInfo.isOnLine = false;

        const { result } = renderHook(() => useApiContext());
        await expect(result.current.get("x")).rejects.toThrow(/No internet connection/);

        const errors = getRecentNetworkErrors();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ method: "GET", status: 0 });
    });

    it("records an HTTP error exactly once (afterResponse, not the catch)", async () => {
        kyCtrl.responder = serverError;

        const { result } = renderHook(() => useApiContext());
        await expect(result.current.get("x")).rejects.toThrow(/500/);

        const errors = getRecentNetworkErrors();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({
            method: "GET",
            url: "https://example.com/x",
            status: 500,
        });
    });

    it("records nothing on success", async () => {
        const { result } = renderHook(() => useApiContext());
        await expect(result.current.get("x")).resolves.toEqual({ ok: true });

        expect(getRecentNetworkErrors()).toHaveLength(0);
    });
});
