import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { kyState, gstState, libConfigState } = vi.hoisted(() => ({
    kyState: {
        post: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
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
        delete: kyState.delete,
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

describe("useApiContext - user-devices endpoints", () => {
    beforeEach(() => {
        kyState.post.mockReset();
        kyState.get.mockReset();
        kyState.delete.mockReset();
        gstState.local.set.mockReset();
        gstState.session.set.mockReset();
        gstState.values.user = undefined;
    });

    it("exposes the 5 user-device methods on the api object", () => {
        const { result } = renderHook(() => useApiContext());
        expect(typeof result.current.listUserDevices).toBe("function");
        expect(typeof result.current.createUserDevice).toBe("function");
        expect(typeof result.current.linkUserDevice).toBe("function");
        expect(typeof result.current.renameUserDevice).toBe("function");
        expect(typeof result.current.deleteUserDevice).toBe("function");
    });

    it("listUserDevices GETs account/user-devices", async () => {
        kyState.get.mockReturnValue(fakeJsonResponse({ devices: [] }));

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.listUserDevices();
        });

        expect(response).toEqual({ devices: [] });
        expect(kyState.get).toHaveBeenCalledWith(
            "account/user-devices",
            expect.any(Object)
        );
    });

    it("createUserDevice POSTs the label+icon body", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 18, label: "mon iPhone", icon: "phone", linked: true })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.createUserDevice({
                label: "mon iPhone",
                icon: "phone",
            });
        });

        expect(response).toEqual({
            id: 18,
            label: "mon iPhone",
            icon: "phone",
            linked: true,
        });
        expect(kyState.post).toHaveBeenCalledWith(
            "account/user-devices",
            expect.objectContaining({
                json: { label: "mon iPhone", icon: "phone" },
            })
        );
    });

    it("linkUserDevice POSTs account/user-devices/{id}/link", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 12, linked: true })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.linkUserDevice(12);
        });

        expect(response).toEqual({ id: 12, linked: true });
        expect(kyState.post).toHaveBeenCalledWith(
            "account/user-devices/12/link",
            expect.any(Object)
        );
    });

    it("renameUserDevice POSTs account/user-devices/{id}/rename with the new label", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 12, label: "iPhone Pro Max" })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.renameUserDevice(12, "iPhone Pro Max");
        });

        expect(response).toEqual({ id: 12, label: "iPhone Pro Max" });
        expect(kyState.post).toHaveBeenCalledWith(
            "account/user-devices/12/rename",
            expect.objectContaining({
                json: { label: "iPhone Pro Max" },
            })
        );
    });

    it("deleteUserDevice DELETEs account/user-devices/{id}", async () => {
        kyState.delete.mockReturnValue(
            fakeJsonResponse({ id: 12, revoked: true, sessions_revoked: 3 })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.deleteUserDevice(12);
        });

        expect(response).toEqual({
            id: 12,
            revoked: true,
            sessions_revoked: 3,
        });
        expect(kyState.delete).toHaveBeenCalledWith(
            "account/user-devices/12",
            expect.any(Object)
        );
    });

    it("createUserDevice clears the needsDevicePick flag on the user state", async () => {
        gstState.values.user = {
            id: 42,
            rememberMe: true,
            needsDevicePick: true,
            existingUserDevices: [{ id: 12, label: "mon iPhone" }],
        };
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 18, linked: true })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.createUserDevice({ label: "x", icon: "phone" });
        });

        // The mock receives one call with the persisted user state.
        expect(gstState.local.set).toHaveBeenCalled();
        const [key, payload] = gstState.local.set.mock.calls[0];
        expect(key).toBe("user");
        expect(payload).toMatchObject({
            id: 42,
            needsDevicePick: false,
            existingUserDevices: [],
        });
    });

    it("linkUserDevice clears the needsDevicePick flag on the user state", async () => {
        gstState.values.user = {
            id: 42,
            rememberMe: false,
            needsDevicePick: true,
            existingUserDevices: [{ id: 12, label: "mon iPhone" }],
        };
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 12, linked: true })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.linkUserDevice(12);
        });

        // rememberMe was false -> persisted in sessionStorage instead.
        expect(gstState.session.set).toHaveBeenCalled();
        const [key, payload] = gstState.session.set.mock.calls[0];
        expect(key).toBe("user");
        expect(payload).toMatchObject({
            id: 42,
            needsDevicePick: false,
        });
    });

    it("renameUserDevice does NOT touch the needsDevicePick flag", async () => {
        gstState.values.user = {
            id: 42,
            rememberMe: true,
            needsDevicePick: true,
        };
        kyState.post.mockReturnValue(
            fakeJsonResponse({ id: 12, label: "renamed" })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.renameUserDevice(12, "renamed");
        });

        expect(gstState.local.set).not.toHaveBeenCalled();
        expect(gstState.session.set).not.toHaveBeenCalled();
    });

    it("deleteUserDevice does NOT touch the needsDevicePick flag", async () => {
        gstState.values.user = {
            id: 42,
            rememberMe: true,
            needsDevicePick: true,
        };
        kyState.delete.mockReturnValue(
            fakeJsonResponse({ id: 12, revoked: true })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.deleteUserDevice(12);
        });

        expect(gstState.local.set).not.toHaveBeenCalled();
        expect(gstState.session.set).not.toHaveBeenCalled();
    });
});

describe("useApiContext - login response shaping", () => {
    beforeEach(() => {
        kyState.post.mockReset();
        kyState.get.mockReset();
        gstState.local.set.mockReset();
        gstState.session.set.mockReset();
        gstState.values.user = undefined;
    });

    it("exposes needsDevicePick + existingUserDevices on the resolved login data", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({
                userid: 42,
                user: "alice",
                access_token: "AT",
                refresh_token: "RT",
                expires_in: 3600,
                needs_device_pick: true,
                existing_user_devices: [
                    { id: 12, label: "mon iPhone", icon: "phone", session_count: 3 },
                ],
            })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.login({
                email: "alice@example.com",
                password: "secret",
                rememberMe: true,
            });
        });

        expect(response.needsDevicePick).toBe(true);
        expect(response.existingUserDevices).toEqual([
            { id: 12, label: "mon iPhone", icon: "phone", session_count: 3 },
        ]);
    });

    it("persists needsDevicePick + existingUserDevices alongside the user state", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({
                userid: 42,
                access_token: "AT",
                refresh_token: "RT",
                expires_in: 3600,
                needs_device_pick: true,
                existing_user_devices: [{ id: 12, label: "mon iPhone" }],
            })
        );

        const { result } = renderHook(() => useApiContext());

        await act(async () => {
            await result.current.login({
                email: "u@x.com",
                password: "x",
                rememberMe: true,
            });
        });

        expect(gstState.local.set).toHaveBeenCalled();
        const [key, payload] = gstState.local.set.mock.calls[0];
        expect(key).toBe("user");
        expect(payload.needsDevicePick).toBe(true);
        expect(payload.existingUserDevices).toEqual([
            { id: 12, label: "mon iPhone" },
        ]);
    });

    it("defaults needsDevicePick=false and existingUserDevices=[] when the backend omits them", async () => {
        kyState.post.mockReturnValue(
            fakeJsonResponse({
                userid: 42,
                access_token: "AT",
                refresh_token: "RT",
                expires_in: 3600,
            })
        );

        const { result } = renderHook(() => useApiContext());

        let response;
        await act(async () => {
            response = await result.current.login({
                email: "u@x.com",
                password: "x",
                rememberMe: true,
            });
        });

        expect(response.needsDevicePick).toBe(false);
        expect(response.existingUserDevices).toEqual([]);
    });
});
