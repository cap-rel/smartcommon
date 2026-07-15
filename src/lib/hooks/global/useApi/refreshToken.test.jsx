/**
 * useApi - refresh token rotation replay guard.
 *
 * The refresh token is rotating / single-use: smartAuth revokes the ENTIRE
 * token family the moment an already-consumed refresh token is presented again
 * (it reads a replay as an attack). `valuesRef` is refreshed on RENDER, so it
 * lags one render behind the gst.set() a refresh() performs. If a second
 * refresh fires in that gap, reading the refresh token from valuesRef would
 * replay the token the first refresh just consumed -> whole family revoked ->
 * dead session.
 *
 * The fix keeps a synchronous mirror (`latestRefreshTokenRef`) of the most
 * recently issued refresh token, updated in login()/refresh()/device() (and QR
 * pairing) and cleared on session death. refresh() prefers it over valuesRef.
 *
 * These tests use the same faithful ky mock as circuitBreaker.test.jsx: it runs
 * the registered `beforeRequest` hooks, so the proactive-expiry refresh path in
 * context.jsx really executes end to end. gst.set is mocked (a no-op on
 * gstState.values), which faithfully reproduces the render lag: valuesRef never
 * sees the rotated token, exactly like a second refresh firing before React
 * re-renders.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { kyCtrl, gstState, libConfigState } = vi.hoisted(() => ({
    kyCtrl: {
        responder: () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    },
    gstState: {
        local: { set: vi.fn() },
        session: { set: vi.fn() },
        unset: vi.fn(),
        values: { user: undefined, deviceId: "test-device-id" },
    },
    libConfigState: {
        api: { prefixUrl: "https://example.com/", timeout: 5000 },
    },
}));

// Faithful-enough ky mock: each instance carries its own beforeRequest hook
// list; extend() concatenates. Calling the instance runs every beforeRequest
// hook in order (so the proactive-expiry refresh really runs), then hands off
// to the controllable responder, which receives (method, url, options) - the
// options still carry the Authorization header refresh() set.
vi.mock("ky", () => {
    const buildInstance = (beforeHooks) => {
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
                return kyCtrl.responder(method, url, options);
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
            buildInstance([...beforeHooks, ...(config?.hooks?.beforeRequest ?? [])]);
        return inst;
    };
    return {
        default: {
            create: (config) => buildInstance([...(config?.hooks?.beforeRequest ?? [])]),
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

import { navigatorInfo } from "lib/utils";
import { useApiContext } from "./context";

// Responder that rotates the refresh token on every /refresh call and records
// the Authorization header it was presented with, so a replay is observable.
const makeRotatingRefreshResponder = () => {
    const refreshAuths = [];
    const responder = (method, url, options) => {
        if (url === "refresh") {
            refreshAuths.push(options?.headers?.Authorization);
            const issued = refreshAuths.length; // 1 -> RT1, 2 -> RT2, ...
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    accessToken: `AT${issued}`,
                    refreshToken: `RT${issued}`,
                    expiresIn: 3600,
                }),
            };
        }
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
    };
    return { responder, refreshAuths };
};

beforeEach(() => {
    gstState.unset.mockReset();
    gstState.local.set.mockReset();
    gstState.session.set.mockReset();
    // Expired token: beforeRequest proactively refreshes before each request.
    // gst.set is mocked, so valuesRef.tokenExpiry stays in the past (the render
    // never applies the rotation) - which is the whole point of the mirror.
    gstState.values.user = {
        accessToken: "AT0",
        refreshToken: "RT0",
        tokenExpiry: 1,
        rememberMe: true,
    };
    libConfigState.api = { prefixUrl: "https://example.com/", timeout: 5000 };
    navigatorInfo.isOnLine = true;
});

describe("useApi - refresh token rotation (replay guard)", () => {
    it("presents the rotated token on the follow-up refresh, not the consumed one", async () => {
        const { responder, refreshAuths } = makeRotatingRefreshResponder();
        kyCtrl.responder = responder;

        const { result } = renderHook(() => useApiContext());

        // Two sequential requests, each awaited so refreshPromiseRef clears in
        // between - i.e. a second refresh firing in the render gap after the
        // first has resolved. Each triggers a proactive-expiry refresh.
        await act(async () => {
            await result.current.get("a");
        });
        await act(async () => {
            await result.current.get("b");
        });

        // First refresh legitimately uses the stored RT0. The SECOND must use
        // RT1 (the token the first refresh rotated to), NOT RT0 again - reading
        // the stale valuesRef would replay RT0 and get the family revoked.
        expect(refreshAuths).toEqual(["Bearer RT0", "Bearer RT1"]);
    });

    it("falls back to the stored token on a fresh mount (mirror starts empty)", async () => {
        const { responder, refreshAuths } = makeRotatingRefreshResponder();
        kyCtrl.responder = responder;

        const { result } = renderHook(() => useApiContext());

        // On a hard reload the mirror ref starts null, so the first refresh must
        // fall back to the refresh token hydrated from storage into valuesRef.
        await act(async () => {
            await result.current.get("a");
        });

        expect(refreshAuths).toEqual(["Bearer RT0"]);
    });
});
