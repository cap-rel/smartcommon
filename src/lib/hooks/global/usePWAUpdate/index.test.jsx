import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";

import { usePWAUpdate } from "./index";

// Minimal Service Worker registration with a worker already waiting, i.e.
// an update detected on mount.
const installServiceWorker = () => {
    const registration = {
        waiting: { postMessage: vi.fn() },
        addEventListener: vi.fn(),
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

        await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining("HTTP 404")));
        expect(result.current.updateAvailable).toBe(true);
        expect(result.current.newVersion).toBeNull();
    });

    it("logs a network error without breaking the update flow", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

        const { result } = renderHook(() => usePWAUpdate());

        await waitFor(() => expect(error).toHaveBeenCalledWith(
            expect.stringContaining("Could not read version.json"),
            expect.any(TypeError),
        ));
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
