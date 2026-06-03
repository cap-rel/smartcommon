import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { usePushNotifications } from "./index";

// useApi is mocked: the hook only uses get/post/del and public.get.
const apiMock = {
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn(),
    public: { get: vi.fn() },
};

vi.mock("lib/hooks", () => ({
    useApi: () => apiMock,
}));

// Shared browser-API mocks, rebuilt per test in beforeEach.
let subscriptionMock;
let pushManagerMock;
let registrationMock;
let swMock;

const enableSupport = (permission = "granted") => {
    subscriptionMock = {
        endpoint: "https://push.example/abc123",
        toJSON: () => ({
            endpoint: "https://push.example/abc123",
            keys: { p256dh: "P256DH_KEY", auth: "AUTH_KEY" },
        }),
        unsubscribe: vi.fn().mockResolvedValue(true),
    };
    pushManagerMock = {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue(subscriptionMock),
    };
    registrationMock = { pushManager: pushManagerMock };
    swMock = {
        ready: Promise.resolve(registrationMock),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };

    Object.defineProperty(window.navigator, "serviceWorker", {
        configurable: true,
        value: swMock,
    });
    window.PushManager = function PushManager() {};
    window.Notification = {
        permission,
        requestPermission: vi.fn().mockResolvedValue("granted"),
    };
};

const disableSupport = () => {
    // Remove every capability detectSupport() probes.
    delete window.navigator.serviceWorker;
    delete window.PushManager;
    delete window.Notification;
};

describe("usePushNotifications", () => {
    beforeEach(() => {
        apiMock.get.mockReset();
        apiMock.post.mockReset();
        apiMock.del.mockReset();
        apiMock.public.get.mockReset();
        apiMock.get.mockResolvedValue({ subscriptions: [] });
    });

    afterEach(() => {
        disableSupport();
        vi.restoreAllMocks();
    });

    it("reports 'unsupported' and no-ops when the browser lacks Web Push", async () => {
        disableSupport();
        const { result } = renderHook(() => usePushNotifications());

        expect(result.current.permission).toBe("unsupported");
        expect(result.current.isLoading).toBe(false);

        let outcome;
        await act(async () => {
            outcome = await result.current.subscribe("Device");
        });
        expect(outcome).toBe(false);
        expect(result.current.error).toMatch(/not supported/i);
        expect(apiMock.public.get).not.toHaveBeenCalled();
        expect(apiMock.post).not.toHaveBeenCalled();
    });

    it("refuses to subscribe and sets an error when permission is denied", async () => {
        enableSupport("denied");
        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.permission).toBe("denied");

        let outcome;
        await act(async () => {
            outcome = await result.current.subscribe();
        });

        expect(outcome).toBe(false);
        expect(result.current.error).toMatch(/blocked/i);
        expect(apiMock.public.get).not.toHaveBeenCalled();
        expect(pushManagerMock.subscribe).not.toHaveBeenCalled();
    });

    it("requests permission when it is still 'default'", async () => {
        enableSupport("default");
        apiMock.public.get.mockReturnValue({ json: async () => ({ publicKey: "dGVzdA" }) });
        const { result } = renderHook(() => usePushNotifications());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.subscribe("My phone");
        });

        expect(window.Notification.requestPermission).toHaveBeenCalledTimes(1);
        expect(result.current.permission).toBe("granted");
        expect(pushManagerMock.subscribe).toHaveBeenCalledTimes(1);
    });

    it("subscribes nominally: VAPID key -> pushManager.subscribe -> POST", async () => {
        enableSupport("granted");
        apiMock.public.get.mockReturnValue({ json: async () => ({ publicKey: "dGVzdA" }) });
        const { result } = renderHook(() => usePushNotifications());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        let outcome;
        await act(async () => {
            outcome = await result.current.subscribe("My phone");
        });

        expect(outcome).toBe(true);

        // VAPID key fetched from the public endpoint, without a leading slash.
        expect(apiMock.public.get).toHaveBeenCalledWith("push/vapid-public-key");

        // Browser subscription requested with userVisibleOnly + a Uint8Array key.
        expect(pushManagerMock.subscribe).toHaveBeenCalledTimes(1);
        const subscribeArg = pushManagerMock.subscribe.mock.calls[0][0];
        expect(subscribeArg.userVisibleOnly).toBe(true);
        expect(subscribeArg.applicationServerKey).toBeInstanceOf(Uint8Array);

        // Subscription persisted server-side via JSON body.
        expect(apiMock.post).toHaveBeenCalledWith("push/subscribe", {
            json: {
                subscription: {
                    endpoint: "https://push.example/abc123",
                    keys: { p256dh: "P256DH_KEY", auth: "AUTH_KEY" },
                },
                label: "My phone",
            },
        });

        expect(result.current.isSubscribed).toBe(true);
    });

    it("unsubscribes on both the browser and the backend", async () => {
        enableSupport("granted");
        pushManagerMock.getSubscription.mockResolvedValue(subscriptionMock);
        const { result } = renderHook(() => usePushNotifications());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        let outcome;
        await act(async () => {
            outcome = await result.current.unsubscribe();
        });

        expect(outcome).toBe(true);
        expect(subscriptionMock.unsubscribe).toHaveBeenCalledTimes(1);
        expect(apiMock.del).toHaveBeenCalledWith("push/unsubscribe", {
            json: { endpoint: "https://push.example/abc123" },
        });
        expect(result.current.isSubscribed).toBe(false);
    });

    it("logs and surfaces an error when the network call fails", async () => {
        enableSupport("granted");
        const consoleErr = vi.spyOn(console, "error").mockImplementation(() => {});
        apiMock.public.get.mockReturnValue({
            json: async () => {
                throw new Error("Network down");
            },
        });
        const { result } = renderHook(() => usePushNotifications());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        let outcome;
        await act(async () => {
            outcome = await result.current.subscribe("Device");
        });

        expect(outcome).toBe(false);
        expect(result.current.error).toMatch(/Network down/);
        expect(consoleErr).toHaveBeenCalled();
        expect(apiMock.post).not.toHaveBeenCalled();
    });

    it("refreshSubscriptions stores the backend list", async () => {
        enableSupport("granted");
        apiMock.get.mockResolvedValue({
            subscriptions: [{ id: 1, label: "Phone", status: 1 }],
        });
        const { result } = renderHook(() => usePushNotifications());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.refreshSubscriptions();
        });

        expect(apiMock.get).toHaveBeenCalledWith("push/subscriptions");
        expect(result.current.subscriptions).toEqual([
            { id: 1, label: "Phone", status: 1 },
        ]);
    });
});
