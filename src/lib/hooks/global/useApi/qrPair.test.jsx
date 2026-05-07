import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { kyState, gstState, libConfigState } = vi.hoisted(() => ({
    kyState: {
        post: vi.fn(),
        get: vi.fn(),
        extend: null,
        create: null,
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

describe("useApiContext - QR pair endpoints", () => {
    beforeEach(() => {
        kyState.post.mockReset();
        kyState.get.mockReset();
        gstState.local.set.mockReset();
        gstState.session.set.mockReset();
        gstState.values.user = undefined;
    });

    const fakeJsonResponse = (data) => ({
        json: vi.fn().mockResolvedValue(data),
    });

    it("exposes claimQrPair and pollQrPair on the api object", () => {
        const { result } = renderHook(() => useApiContext());
        expect(typeof result.current.claimQrPair).toBe("function");
        expect(typeof result.current.pollQrPair).toBe("function");
    });

    it("claimQrPair posts to qr-pair/{id}/claim with the body", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ status: "claimed", claim_token: "abc" })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.claimQrPair(
                "deadbeef".repeat(4),
                { device_label: "iPhone Eric", device_uuid: "u-1" }
            );
        });

        expect(response).toEqual({ status: "claimed", claim_token: "abc" });
        expect(kyState.post).toHaveBeenCalledWith(
            "qr-pair/deadbeefdeadbeefdeadbeefdeadbeef/claim",
            expect.objectContaining({
                json: { device_label: "iPhone Eric", device_uuid: "u-1" },
            })
        );
    });

    it("pollQrPair posts to qr-pair/{id}/poll with claim_token", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ status: "pending" })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.pollQrPair("paircode", "tok-123");
        });

        expect(response).toEqual({ status: "pending" });
        expect(kyState.post).toHaveBeenCalledWith(
            "qr-pair/paircode/poll",
            expect.objectContaining({
                json: { claim_token: "tok-123" },
            })
        );
    });

    it("pollQrPair persists the user in local storage on status=consumed", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({
                status: "consumed",
                access_token: "AT",
                refresh_token: "RT",
                expires_in: 3600,
                device_uuid: "DUUID",
            })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.pollQrPair("p1", "ct1");
        });

        expect(gstState.local.set).toHaveBeenCalledTimes(1);
        const [key, payload] = gstState.local.set.mock.calls[0];
        expect(key).toBe("user");
        expect(payload).toMatchObject({
            accessToken: "AT",
            refreshToken: "RT",
            expiresIn: 3600,
            deviceUuid: "DUUID",
        });
        expect(typeof payload.tokenExpiry).toBe("number");
        expect(payload.tokenExpiry).toBeGreaterThan(0);
    });

    it("pollQrPair does NOT persist a user when status is not consumed", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ status: "pending" })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.pollQrPair("p1", "ct1");
        });

        expect(gstState.local.set).not.toHaveBeenCalled();
    });

    it("pollQrPair does NOT persist when status=consumed but access_token missing", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ status: "consumed" })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.pollQrPair("p1", "ct1");
        });

        expect(gstState.local.set).not.toHaveBeenCalled();
    });

    it("claimQrPair throws if body is not a plain object", () => {
        const { result } = renderHook(() => useApiContext());

        expect(() => result.current.claimQrPair("p1", "not-an-object")).toThrow();
    });

    it("pollQrPair throws if options is not a plain object", () => {
        const { result } = renderHook(() => useApiContext());

        expect(() => result.current.pollQrPair("p1", "tok", "bad")).toThrow();
    });
});
