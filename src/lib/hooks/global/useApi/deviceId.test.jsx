/**
 * useApi - device id integrity.
 *
 * smartAuth refuses any X-DEVICEID that is not an RFC 4122 UUID or a 32-64
 * char hex string, and it does so on /login: a browser holding an empty or
 * corrupted device id got a 500 on every login attempt, with no way to
 * recover from inside the app. These tests pin the self-healing behaviour:
 * an invalid value is regenerated (at mount AND at request time) and the
 * device endpoint refuses to persist an id the backend would reject.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const { kyState, gstState, libConfigState } = vi.hoisted(() => ({
    kyState: {
        post: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
    },
    gstState: {
        local: { set: vi.fn() },
        session: { set: vi.fn() },
        unset: vi.fn(),
        values: { user: undefined, deviceId: "" },
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
    kyState.create.mockImplementation(() => fakeInstance);
    return {
        default: {
            create: kyState.create,
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

const deviceIdWrites = () => gstState.local.set.mock.calls.filter(([key]) => key === "deviceId");

describe("useApi - device id integrity", () => {
    beforeEach(() => {
        kyState.post.mockReset();
        kyState.get.mockReset();
        kyState.create.mockClear();
        gstState.local.set.mockReset();
        gstState.session.set.mockReset();
        gstState.values.user = undefined;
        gstState.values.deviceId = "";
    });

    it("regenerates a stored empty device id at mount", () => {
        renderHook(() => useApiContext());

        const writes = deviceIdWrites();
        expect(writes).toHaveLength(1);
        expect(writes[0][1]).toMatch(UUID_RE);
    });

    it("leaves a valid device id untouched", () => {
        gstState.values.deviceId = "11111111-2222-4333-8444-555555555555";

        renderHook(() => useApiContext());

        expect(deviceIdWrites()).toHaveLength(0);
    });

    it("accepts a sha256-shaped device id (smartAuth also does)", () => {
        gstState.values.deviceId = "a".repeat(64);

        renderHook(() => useApiContext());

        expect(deviceIdWrites()).toHaveLength(0);
    });

    it("never builds a ky instance with an empty X-DEVICEID header", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 42, accessToken: "AT", refreshToken: "RT", expiresIn: 3600 })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.login({ login: "u@example.com", password: "x", rememberMe: true });
        });

        expect(kyState.create).toHaveBeenCalled();
        for (const [config] of kyState.create.mock.calls) {
            expect(config.headers["X-DEVICEID"]).toMatch(UUID_RE);
        }
    });

    it("regenerates at request time even when the mount effect could not persist", async () => {
        // gst is mocked, so local.set never feeds gstState.values back: the
        // context keeps seeing the invalid id, exactly like a browser whose
        // storage write silently failed.
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 42, accessToken: "AT", refreshToken: "RT", expiresIn: 3600 })
        );

        const { result } = renderHook(() => useApiContext());
        gstState.local.set.mockReset();

        await act(async () => {
            await result.current.login({ login: "u@example.com", password: "x", rememberMe: true });
        });

        const writes = deviceIdWrites();
        expect(writes.length).toBeGreaterThan(0);
        expect(writes[writes.length - 1][1]).toMatch(UUID_RE);
    });

    it("refuses to adopt an invalid uuid from the device picker", async () => {
        gstState.values.deviceId = "11111111-2222-4333-8444-555555555555";
        gstState.values.user = {
            accessToken: "AT",
            refreshToken: "RT",
            tokenExpiry: Math.floor(Date.now() / 1000) + 3600,
            rememberMe: true,
            deviceOptions: [{ label: "iPhone", uuid: "22222222-3333-4444-8555-666666666666" }],
        };

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await expect(result.current.device({ label: "", uuid: "" })).rejects.toMatchObject({
                apiCode: "invalid_device_uuid",
            });
        });

        expect(kyState.post).not.toHaveBeenCalled();
        expect(deviceIdWrites()).toHaveLength(0);
    });

    it("still adopts a valid uuid picked from the device list", async () => {
        const picked = "22222222-3333-4444-8555-666666666666";
        gstState.values.deviceId = "11111111-2222-4333-8444-555555555555";
        gstState.values.user = {
            accessToken: "AT",
            refreshToken: "RT",
            tokenExpiry: Math.floor(Date.now() / 1000) + 3600,
            rememberMe: true,
            deviceOptions: [{ label: "iPhone", uuid: picked }],
        };
        kyState.post.mockReturnValue(fakeJsonResponse({ accessToken: "AT2", expiresIn: 3600 }));

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.device({ label: "", uuid: picked });
        });

        expect(kyState.post).toHaveBeenCalledTimes(1);
        expect(kyState.post.mock.calls[0][1].json).toMatchObject({ uuid: picked });
        expect(deviceIdWrites()).toEqual([["deviceId", picked]]);
    });
});
