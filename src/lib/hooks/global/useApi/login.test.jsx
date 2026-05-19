/**
 * useApi.login - race condition tests
 *
 * Today, api.login persists a minimal user (tokens + a few flags) to
 * gst BEFORE the consumer has had a chance to enrich it with the
 * settings/config that live in IndexedDB. RouteGuard sees the user
 * defined and redirects to the protected route, which then destructures
 * `user.settings.X` and crashes.
 *
 * Proposed fix: an optional `onLoginPersist` hook on the libConfig.api
 * config that lets the consumer enrich the user BEFORE useApi commits
 * it to gst. When fournie, useApi.login awaits the callback and writes
 * the returned user once, atomically.
 *
 * The tests below cover:
 *   1. Baseline (no onLoginPersist) - documents current behaviour.
 *   2. With onLoginPersist - the only gst.set call carries the enriched
 *      user and happens after the callback resolves.
 *   3. Sequencing - while onLoginPersist is pending, no user has been
 *      written to gst yet.
 *
 * Tests 2 and 3 fail today; they go green once the fix lands.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { kyState, gstState, libConfigState } = vi.hoisted(() => ({
    kyState: {
        post: vi.fn(),
        get: vi.fn(),
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

vi.mock("ky", () => {
    const fakeInstance = {
        post: kyState.post,
        get: kyState.get,
        extend: () => fakeInstance,
    };
    fakeInstance.extend = vi.fn(() => fakeInstance);
    return {
        default: {
            create: vi.fn(() => fakeInstance),
        },
    };
});

vi.mock("lib/hooks", () => ({
    useGlobalStates: () => gstState,
    useLibConfig: () => libConfigState,
}));

vi.mock("lib/hooks/useApiTest2/useLogin", () => ({
    loginMap: (data) => data,
}));

vi.mock("lib/hooks/useApiTest2/useRefreshAccessToken", () => ({
    refreshAccessTokenMap: (data) => data,
}));

import { useApiContext } from "./context";

const fakeJsonResponse = (data) => ({
    json: vi.fn().mockResolvedValue(data),
});

const minimalLoginPayload = {
    id: 42,
    accessToken: "AT",
    refreshToken: "RT",
    expiresIn: 3600,
};

beforeEach(() => {
    kyState.post.mockReset();
    kyState.get.mockReset();
    gstState.local.set.mockReset();
    gstState.session.set.mockReset();
    gstState.values.user = undefined;
    // Reset libConfig.api between tests so onLoginPersist doesn't leak.
    libConfigState.api = { prefixUrl: "https://example.com/", timeout: 5000 };
});

describe("useApi.login - baseline (no onLoginPersist)", () => {
    it("persists the minimal user immediately (current behaviour)", async () => {
        kyState.post.mockReturnValue(fakeJsonResponse(minimalLoginPayload));

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.login({
                login: "u@example.com",
                password: "x",
                rememberMe: true,
            });
        });

        expect(gstState.local.set).toHaveBeenCalledTimes(1);
        const [key, payload] = gstState.local.set.mock.calls[0];
        expect(key).toBe("user");
        // User is minimal: no settings, no config.
        expect(payload.settings).toBeUndefined();
        expect(payload.config).toBeUndefined();
        expect(payload).toMatchObject({
            id: 42,
            accessToken: "AT",
            refreshToken: "RT",
        });
    });
});

describe("useApi.login - with onLoginPersist (Bug 2 fix)", () => {
    it("awaits onLoginPersist and commits the enriched user to gst", async () => {
        const enriched = {
            ...minimalLoginPayload,
            settings: { lang: "fr" },
            config: { theme: "dark" },
        };
        const onLoginPersist = vi.fn(async (mappedData) => ({
            ...mappedData,
            settings: { lang: "fr" },
            config: { theme: "dark" },
        }));
        libConfigState.api = {
            ...libConfigState.api,
            onLoginPersist,
        };

        kyState.post.mockReturnValue(fakeJsonResponse(minimalLoginPayload));

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.login({
                login: "u@example.com",
                password: "x",
                rememberMe: true,
            });
        });

        // Consumer's enrichment callback was invoked.
        expect(onLoginPersist).toHaveBeenCalledTimes(1);
        expect(onLoginPersist).toHaveBeenCalledWith(
            expect.objectContaining({ id: 42, accessToken: "AT" })
        );

        // gst was written exactly once, with the enriched user.
        expect(gstState.local.set).toHaveBeenCalledTimes(1);
        const [key, payload] = gstState.local.set.mock.calls[0];
        expect(key).toBe("user");
        expect(payload.settings).toEqual(enriched.settings);
        expect(payload.config).toEqual(enriched.config);
        // The auth/device fields useApi adds itself must still be present.
        expect(payload.rememberMe).toBe(true);
        expect(typeof payload.tokenExpiry).toBe("number");
    });

    it("does NOT write to gst while onLoginPersist is still pending", async () => {
        let resolveCallback;
        const onLoginPersist = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveCallback = resolve;
                })
        );
        libConfigState.api = {
            ...libConfigState.api,
            onLoginPersist,
        };

        kyState.post.mockReturnValue(fakeJsonResponse(minimalLoginPayload));

        const { result } = renderHook(() => useApiContext());

        let loginPromise;
        await act(async () => {
            loginPromise = result.current.login({
                login: "u@example.com",
                password: "x",
                rememberMe: true,
            });
            // Let the response.json() microtask flush so login reaches
            // the await on onLoginPersist.
            await Promise.resolve();
            await Promise.resolve();
        });

        // Callback has been invoked but is still pending - no user in gst yet.
        expect(onLoginPersist).toHaveBeenCalledTimes(1);
        expect(gstState.local.set).not.toHaveBeenCalled();
        expect(gstState.session.set).not.toHaveBeenCalled();

        // Resolve the callback and let login complete.
        await act(async () => {
            resolveCallback({
                ...minimalLoginPayload,
                settings: { lang: "fr" },
            });
            await loginPromise;
        });

        expect(gstState.local.set).toHaveBeenCalledTimes(1);
        const [, payload] = gstState.local.set.mock.calls[0];
        expect(payload.settings).toEqual({ lang: "fr" });
    });

    it("falls back to the minimal user if onLoginPersist throws", async () => {
        const onLoginPersist = vi.fn(async () => {
            throw new Error("indexedDB unavailable");
        });
        libConfigState.api = {
            ...libConfigState.api,
            onLoginPersist,
        };

        kyState.post.mockReturnValue(fakeJsonResponse(minimalLoginPayload));

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.login({
                login: "u@example.com",
                password: "x",
                rememberMe: true,
            });
        });

        // Login still resolves and a user is still posted (degraded mode).
        expect(gstState.local.set).toHaveBeenCalledTimes(1);
        const [, payload] = gstState.local.set.mock.calls[0];
        expect(payload).toMatchObject({ id: 42, accessToken: "AT" });
    });
});
