import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { registerPushHandlers } from "./registerPushHandlers";

// The helper reads the Service Worker global `self`. We swap globalThis.self
// for a controllable mock for the duration of each test, capturing the
// listeners it registers so we can fire synthetic events at them.

let listeners;
let showNotification;
let matchAll;
let openWindow;
let pushManagerSubscribe;
let originalSelf;

const fireEvent = (type, event) => {
    const handler = listeners[type];
    if (!handler) throw new Error(`no listener registered for ${type}`);
    return handler(event);
};

beforeEach(() => {
    listeners = {};
    showNotification = vi.fn().mockResolvedValue(undefined);
    matchAll = vi.fn().mockResolvedValue([]);
    openWindow = vi.fn().mockResolvedValue(undefined);
    pushManagerSubscribe = vi.fn();

    originalSelf = globalThis.self;
    globalThis.self = {
        addEventListener: (type, cb) => {
            listeners[type] = cb;
        },
        registration: {
            showNotification,
            pushManager: { subscribe: pushManagerSubscribe },
        },
        clients: { matchAll, openWindow },
        location: { origin: "https://app.example" },
    };
});

afterEach(() => {
    globalThis.self = originalSelf;
    vi.restoreAllMocks();
});

describe("registerPushHandlers", () => {
    it("registers the four push lifecycle listeners", () => {
        registerPushHandlers();
        expect(Object.keys(listeners).sort()).toEqual([
            "notificationclick",
            "notificationclose",
            "push",
            "pushsubscriptionchange",
        ]);
    });

    it("shows a notification from a JSON payload, payload values win over defaults", () => {
        registerPushHandlers({ defaultIcon: "/d-icon.png", defaultBadge: "/d-badge.png" });
        const waitUntil = vi.fn();
        fireEvent("push", {
            waitUntil,
            data: {
                json: () => ({
                    title: "Hello",
                    body: "World",
                    icon: "/custom.png",
                    tag: "t1",
                    data: { url: "/x" },
                }),
            },
        });
        expect(showNotification).toHaveBeenCalledWith(
            "Hello",
            expect.objectContaining({
                body: "World",
                icon: "/custom.png", // payload wins
                badge: "/d-badge.png", // falls back to default
                tag: "t1",
                data: { url: "/x" },
            })
        );
        expect(waitUntil).toHaveBeenCalled();
    });

    it("falls back to the default title and text body on a non-JSON payload", () => {
        registerPushHandlers({ defaultTitle: "MyApp" });
        fireEvent("push", {
            waitUntil: vi.fn(),
            data: {
                json: () => {
                    throw new Error("not json");
                },
                text: () => "plain text",
            },
        });
        expect(showNotification).toHaveBeenCalledWith(
            "MyApp",
            expect.objectContaining({ body: "plain text" })
        );
    });

    it("ignores a push event without data", () => {
        registerPushHandlers();
        fireEvent("push", { waitUntil: vi.fn(), data: null });
        expect(showNotification).not.toHaveBeenCalled();
    });

    it("on a sync push with no focused client, posts trigger-sync AND shows the notification", async () => {
        const postMessage = vi.fn();
        matchAll.mockResolvedValue([{ postMessage }]); // open but not focused/visible

        registerPushHandlers();
        const waitUntil = vi.fn((p) => p);
        fireEvent("push", {
            waitUntil,
            data: {
                json: () => ({
                    title: "Maj",
                    body: "Intervention modifiee",
                    data: { action: "sync", url: "/interventions" },
                }),
            },
        });
        await waitUntil.mock.calls[0][0];

        expect(postMessage).toHaveBeenCalledWith({
            type: "trigger-sync",
            data: { action: "sync", url: "/interventions" },
        });
        expect(showNotification).toHaveBeenCalledWith(
            "Maj",
            expect.objectContaining({ body: "Intervention modifiee" })
        );
    });

    it("on a sync push with a focused client, posts trigger-sync but suppresses the notification", async () => {
        const postMessage = vi.fn();
        matchAll.mockResolvedValue([{ postMessage, focused: true }]);

        registerPushHandlers();
        const waitUntil = vi.fn((p) => p);
        fireEvent("push", {
            waitUntil,
            data: {
                json: () => ({
                    title: "Maj",
                    body: "Intervention modifiee",
                    data: { action: "sync" },
                }),
            },
        });
        await waitUntil.mock.calls[0][0];

        expect(postMessage).toHaveBeenCalledWith({
            type: "trigger-sync",
            data: { action: "sync" },
        });
        expect(showNotification).not.toHaveBeenCalled();
    });

    it("a non-sync push never posts a trigger-sync message (backward compatible)", async () => {
        const postMessage = vi.fn();
        matchAll.mockResolvedValue([{ postMessage, focused: true }]);

        registerPushHandlers();
        const waitUntil = vi.fn((p) => p);
        fireEvent("push", {
            waitUntil,
            data: {
                json: () => ({ title: "Hello", body: "World", data: { url: "/x" } }),
            },
        });
        await waitUntil.mock.calls[0][0];

        expect(postMessage).not.toHaveBeenCalled();
        expect(showNotification).toHaveBeenCalledWith(
            "Hello",
            expect.objectContaining({ body: "World" })
        );
    });

    it("opens a window to data.url on notificationclick when no client is open", async () => {
        registerPushHandlers();
        const waitUntil = vi.fn((p) => p);
        await fireEvent("notificationclick", {
            notification: { close: vi.fn(), data: { url: "/interventions" } },
            waitUntil,
        });
        await waitUntil.mock.calls[0][0];
        expect(openWindow).toHaveBeenCalledWith("/interventions");
    });

    it("does not navigate on the dismiss action", async () => {
        registerPushHandlers();
        await fireEvent("notificationclick", {
            action: "dismiss",
            notification: { close: vi.fn(), data: { url: "/interventions" } },
            waitUntil: vi.fn((p) => p),
        });
        expect(openWindow).not.toHaveBeenCalled();
    });

    it("posts a push-resubscribe message to clients on pushsubscriptionchange", async () => {
        const postMessage = vi.fn();
        matchAll.mockResolvedValue([{ postMessage }]);
        pushManagerSubscribe.mockResolvedValue({
            toJSON: () => ({ endpoint: "https://push/new", keys: { p256dh: "p", auth: "a" } }),
        });

        registerPushHandlers();
        const waitUntil = vi.fn((p) => p);
        fireEvent("pushsubscriptionchange", {
            oldSubscription: { options: { userVisibleOnly: true }, endpoint: "https://push/old" },
            waitUntil,
        });
        await waitUntil.mock.calls[0][0];

        expect(pushManagerSubscribe).toHaveBeenCalledWith({ userVisibleOnly: true });
        expect(postMessage).toHaveBeenCalledWith({
            type: "push-resubscribe",
            subscription: { endpoint: "https://push/new", keys: { p256dh: "p", auth: "a" } },
            oldEndpoint: "https://push/old",
        });
    });

    it("no-ops outside a Service Worker context", () => {
        globalThis.self = { addEventListener: undefined };
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(() => registerPushHandlers()).not.toThrow();
        expect(warn).toHaveBeenCalled();
    });
});
