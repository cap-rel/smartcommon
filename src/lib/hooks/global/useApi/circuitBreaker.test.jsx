/**
 * Circuit breaker reset on reconnection (todo item 21).
 *
 * When a request is fired offline, the baseApi `beforeRequest` hook opens the
 * breaker for 5s (tagged `offline`) and rejects. Two complementary mechanisms
 * make sure the offline submission queue flushes on reconnection:
 *
 *   - `isCircuitOpen()` treats an `offline`-tagged breaker as closed the moment
 *     `navigator.onLine` is true again, so queued drains stop being blocked
 *     immediately - even within the 5s cooldown and without relying on the
 *     'online' event (navigatorInfo can lag). Server/auth-driven trips (5xx,
 *     dead session) leave `offline` false and keep blocking while online.
 *   - the window 'online' event additionally calls `resetCircuit()`, EXCEPT for
 *     a known-dead session (401) whose 30s circuit is intentional.
 *   - api.resetCircuit() is exposed so consumers can force a clean retry.
 *
 * Unlike the other useApi tests, this file uses a faithful ky mock that
 * actually runs the registered `beforeRequest` hooks, so the real circuit
 * logic in context.jsx is exercised end to end.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { kyCtrl, gstState, libConfigState } = vi.hoisted(() => ({
    kyCtrl: {
        // Default responder: a successful 200 with a tiny JSON body.
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
// hook in order (so the circuit/offline checks really run), then hands off to
// the controllable responder.
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
            // Mirror ky's ResponsePromise: the returned value is awaitable to
            // the Response (used by createApiMethod, which awaits then calls
            // response.json()) AND exposes a .json() shortcut that resolves the
            // parsed body directly (used by refresh/logout, which chain
            // .METHOD(url).json() without awaiting first).
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

const success = () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });
const unauthorized = () => {
    throw Object.assign(new Error("Unauthorized"), { response: { status: 401 } });
};

beforeEach(() => {
    kyCtrl.responder = success;
    gstState.unset.mockReset();
    gstState.local.set.mockReset();
    gstState.values.user = undefined;
    libConfigState.api = { prefixUrl: "https://example.com/", timeout: 5000 };
    navigatorInfo.isOnLine = true;
});

describe("circuit breaker - reconnection reset", () => {
    it("clears the offline breaker as soon as connectivity is back so requests flow again", async () => {
        const { result } = renderHook(() => useApiContext());

        // Offline: request rejects and opens the offline-tagged breaker.
        navigatorInfo.isOnLine = false;
        await expect(result.current.get("x")).rejects.toThrow(/No internet connection/);

        // Back online: an offline-tripped breaker stops blocking immediately,
        // even within the 5s cooldown and without waiting for the 'online'
        // event, so the queued drains flush.
        navigatorInfo.isOnLine = true;
        await expect(result.current.get("x")).resolves.toEqual({ ok: true });

        // The 'online' event handler is also wired (it calls resetCircuit) and
        // simply keeps requests flowing.
        await act(async () => {
            window.dispatchEvent(new Event("online"));
        });
        await expect(result.current.get("x")).resolves.toEqual({ ok: true });
    });

    it("does NOT clear the breaker on 'online' for a dead session (401)", async () => {
        const { result } = renderHook(() => useApiContext());

        // A 401 proves a dead session: it ejects the user and opens a 30s circuit.
        kyCtrl.responder = unauthorized;
        await expect(result.current.get("x")).rejects.toThrow();
        expect(gstState.unset).toHaveBeenCalledWith("user");

        // Even though the server would now answer, the dead-session circuit must
        // survive the 'online' event (the session is still invalid until re-login).
        kyCtrl.responder = success;
        await act(async () => {
            window.dispatchEvent(new Event("online"));
        });

        await expect(result.current.get("x")).rejects.toThrow(/Circuit breaker open/);
    });

    it("exposes resetCircuit() to force-clear a breaker that stays open while online", async () => {
        const { result } = renderHook(() => useApiContext());

        expect(typeof result.current.resetCircuit).toBe("function");

        // A dead-session (401) trip opens a NON-offline 30s breaker which, unlike
        // an offline one, keeps blocking even while online - the right vehicle to
        // prove resetCircuit() forces it closed.
        kyCtrl.responder = unauthorized;
        await expect(result.current.get("x")).rejects.toThrow();
        expect(gstState.unset).toHaveBeenCalledWith("user");

        kyCtrl.responder = success;
        await expect(result.current.get("x")).rejects.toThrow(/Circuit breaker open/);

        act(() => {
            result.current.resetCircuit();
        });

        await expect(result.current.get("x")).resolves.toEqual({ ok: true });
    });
});

describe("session + response hardening (review P1-7/8/9/10)", () => {
    it("ejects only once when a flood of concurrent requests all hit 401 (P1-10)", async () => {
        const onSessionExpired = vi.fn();
        libConfigState.api = { ...libConfigState.api, onSessionExpired };
        kyCtrl.responder = unauthorized;

        const { result } = renderHook(() => useApiContext());

        const settled = await Promise.allSettled([
            result.current.get("a"),
            result.current.get("b"),
            result.current.get("c"),
            result.current.get("d"),
            result.current.get("e"),
        ]);

        expect(settled.every((r) => r.status === "rejected")).toBe(true);
        // A single eject for the whole flood: user unset + notification once.
        expect(gstState.unset).toHaveBeenCalledTimes(1);
        expect(gstState.unset).toHaveBeenCalledWith("user");
        expect(onSessionExpired).toHaveBeenCalledTimes(1);
    });

    it("logout clears the local user even when the network call fails (P1-7)", async () => {
        kyCtrl.responder = () => {
            throw new Error("network down");
        };
        const { result } = renderHook(() => useApiContext());

        // Client logout always succeeds ...
        await expect(result.current.logout()).resolves.toBeUndefined();
        // ... and the user is gone locally.
        expect(gstState.unset).toHaveBeenCalledWith("user");
    });

    it("returns null on a 204 No Content instead of throwing on empty body (P1-8)", async () => {
        kyCtrl.responder = () => ({
            ok: true,
            status: 204,
            headers: { get: () => null },
            json: async () => {
                throw new SyntaxError("Unexpected end of JSON input");
            },
        });
        const { result } = renderHook(() => useApiContext());

        await expect(result.current.del("x")).resolves.toBeNull();
    });

    it("refreshes once on an expired token then proceeds with the request (P1-9)", async () => {
        gstState.values.user = {
            accessToken: "old",
            refreshToken: "rt",
            tokenExpiry: 1, // far in the past -> beforeRequest must refresh
            rememberMe: true,
        };
        let refreshCount = 0;
        kyCtrl.responder = (method, url) => {
            if (url === "refresh") {
                refreshCount += 1;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ accessToken: "new", expiresIn: 3600 }),
                };
            }
            return success();
        };
        const { result } = renderHook(() => useApiContext());

        await expect(result.current.get("a")).resolves.toEqual({ ok: true });
        expect(refreshCount).toBe(1);
    });
});
