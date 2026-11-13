import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";

import { usePWAUpdate } from "./index";

// The logger prefixes a styled badge and the namespace: match the message
// anywhere in the arguments of any call.
const loggedText = (spy) => spy.mock.calls.map((call) => call.map(String).join(" ")).join("\n");

// Minimal Service Worker registration with a worker already waiting, i.e.
// an update detected on mount.
const installServiceWorker = () => {
    const registration = {
        waiting: { postMessage: vi.fn() },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
            controller: {},
            getRegistration: vi.fn().mockResolvedValue(registration),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        },
    });
    return registration;
};

const jsonResponse = (body, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
});

describe("usePWAUpdate version info", () => {
    let fetchMock;

    beforeEach(() => {
        installServiceWorker();
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        // Unmount first: the hook cleanup still reads navigator.serviceWorker.
        cleanup();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        delete navigator.serviceWorker;
    });

    it("reads version.json when an update is detected", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ version: "1.4.0", notes: "Faster sync" }));

        const { result } = renderHook(() => usePWAUpdate());

        await waitFor(() => expect(result.current.newVersion).toBe("1.4.0"));
        expect(result.current.updateAvailable).toBe(true);
        expect(result.current.releaseNotes).toBe("Faster sync");
    });

    it("bypasses the precache with a query parameter and no-store", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ version: "2" }));

        renderHook(() => usePWAUpdate());

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        const [url, init] = fetchMock.mock.calls[0];
        expect(url.pathname.endsWith("/version.json")).toBe(true);
        expect(url.searchParams.has("_")).toBe(true);
        expect(init).toEqual({ cache: "no-store" });
    });

    it("uses a custom versionUrl", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ version: 3 }));

        const { result } = renderHook(() => usePWAUpdate({ versionUrl: "/meta/build.json" }));

        await waitFor(() => expect(result.current.newVersion).toBe("3"));
        expect(fetchMock.mock.calls[0][0].pathname).toBe("/meta/build.json");
    });

    it("does not fetch anything when versionUrl is null", async () => {
        const { result } = renderHook(() => usePWAUpdate({ versionUrl: null }));

        await waitFor(() => expect(result.current.updateAvailable).toBe(true));
        expect(fetchMock).not.toHaveBeenCalled();
        expect(result.current.newVersion).toBeNull();
    });

    it("logs and keeps the version unknown when the file is missing", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        fetchMock.mockResolvedValue(jsonResponse({}, 404));

        const { result } = renderHook(() => usePWAUpdate());

        await waitFor(() => expect(loggedText(warn)).toContain("HTTP 404"));
        expect(result.current.updateAvailable).toBe(true);
        expect(result.current.newVersion).toBeNull();
    });

    it("logs a network error without breaking the update flow", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

        const { result } = renderHook(() => usePWAUpdate());

        await waitFor(() => expect(error.mock.calls.some((call) =>
            call.some((arg) => arg instanceof TypeError) && call.map(String).join(" ").includes("Could not read version.json")
        )).toBe(true));
        expect(result.current.updateAvailable).toBe(true);
        expect(result.current.newVersion).toBeNull();
    });

    it("ignores blank notes", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ version: "1.0.1", notes: "   " }));

        const { result } = renderHook(() => usePWAUpdate());

        await waitFor(() => expect(result.current.newVersion).toBe("1.0.1"));
        expect(result.current.releaseNotes).toBeNull();
    });
});

describe("usePWAUpdate listeners", () => {
    let registration;

    beforeEach(() => {
        registration = installServiceWorker();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ version: "1.4.0" })));
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        delete navigator.serviceWorker;
    });

    const updateFoundListeners = () => registration.addEventListener.mock.calls.filter(([type]) => type === "updatefound");

    it("does not add another updatefound listener when the callbacks change", async () => {
        const { rerender } = renderHook(() => usePWAUpdate({ onUpdateAvailable: () => {} }));
        await waitFor(() => expect(updateFoundListeners()).toHaveLength(1));

        rerender();
        rerender();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(updateFoundListeners()).toHaveLength(1);
    });

    it("removes its updatefound listener on unmount", async () => {
        const { unmount } = renderHook(() => usePWAUpdate());
        await waitFor(() => expect(updateFoundListeners()).toHaveLength(1));
        const [, listener] = updateFoundListeners()[0];

        unmount();

        expect(registration.removeEventListener).toHaveBeenCalledWith("updatefound", listener);
    });

    it("calls the latest onUpdateAvailable", async () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(({ cb }) => usePWAUpdate({ onUpdateAvailable: cb }), { initialProps: { cb: first } });
        await waitFor(() => expect(first).toHaveBeenCalled());

        rerender({ cb: second });
        const [, listener] = updateFoundListeners()[0];
        const installing = { state: "installed", addEventListener: vi.fn() };
        registration.installing = installing;
        listener();
        const [, onStateChange] = installing.addEventListener.mock.calls[0];
        onStateChange({ target: installing });

        expect(second).toHaveBeenCalled();
    });
});
