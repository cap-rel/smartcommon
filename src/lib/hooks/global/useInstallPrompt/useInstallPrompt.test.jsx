import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { INSTALL_STATE_KEY, useInstallPrompt } from "./index";
import { detectPlatform, detectStandalone, queryRelatedAppInstalled } from "./detect";

const apiMock = {
    user: { accessToken: "jwt" },
    setDeviceInstallState: vi.fn(),
};

vi.mock("lib/hooks", () => ({
    useApi: () => apiMock,
}));

/**
 * happy-dom answers false to every unknown media query, which is exactly
 * a browser tab. Each test that needs "installed" overrides it.
 */
const mockMatchMedia = (matching = []) => {
    window.matchMedia = vi.fn((query) => ({
        matches: matching.some((m) => query.includes(m)),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
    }));
};

const setUserAgent = (ua) => {
    Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        get: () => ua,
    });
};

const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36";
const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile Safari/604.1";
const DESKTOP_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

/** Fire the Chromium event that proves the app is installable and not installed. */
const fireBeforeInstallPrompt = (userChoice = "accepted") => {
    const event = new Event("beforeinstallprompt");
    event.prompt = vi.fn().mockResolvedValue(undefined);
    event.userChoice = Promise.resolve({ outcome: userChoice });
    act(() => {
        window.dispatchEvent(event);
    });
    return event;
};

describe("detect helpers", () => {
    beforeEach(() => {
        mockMatchMedia();
        setUserAgent(DESKTOP_UA);
        delete window.navigator.standalone;
    });

    it("detects a plain browser tab as not standalone", () => {
        expect(detectStandalone()).toBe(false);
    });

    it("detects display-mode: standalone", () => {
        mockMatchMedia(["standalone"]);
        expect(detectStandalone()).toBe(true);
    });

    it("detects minimal-ui and fullscreen, which are install modes too", () => {
        mockMatchMedia(["minimal-ui"]);
        expect(detectStandalone()).toBe(true);
        mockMatchMedia(["fullscreen"]);
        expect(detectStandalone()).toBe(true);
    });

    it("detects navigator.standalone, the only signal on iOS before 17", () => {
        mockMatchMedia();
        Object.defineProperty(window.navigator, "standalone", {
            configurable: true,
            get: () => true,
        });
        expect(detectStandalone()).toBe(true);
    });

    it("buckets platforms from the user agent", () => {
        setUserAgent(IPHONE_UA);
        expect(detectPlatform()).toBe("ios");
        setUserAgent(ANDROID_UA);
        expect(detectPlatform()).toBe("android");
        setUserAgent(DESKTOP_UA);
        expect(detectPlatform()).toBe("desktop");
    });

    it("sees through the iPadOS desktop user agent", () => {
        setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15");
        Object.defineProperty(window.navigator, "maxTouchPoints", {
            configurable: true,
            get: () => 5,
        });
        expect(detectPlatform()).toBe("ios");
        Object.defineProperty(window.navigator, "maxTouchPoints", {
            configurable: true,
            get: () => 0,
        });
    });

    it("never answers 'not installed' from getInstalledRelatedApps", async () => {
        // An empty list means "no related app declared", which a manifest
        // without related_applications also produces. Answering false
        // there would claim a certainty we do not have.
        navigator.getInstalledRelatedApps = vi.fn().mockResolvedValue([]);
        await expect(queryRelatedAppInstalled()).resolves.toBeNull();

        navigator.getInstalledRelatedApps = vi.fn().mockResolvedValue([{ platform: "webapp", url: "x" }]);
        await expect(queryRelatedAppInstalled()).resolves.toBe(true);

        delete navigator.getInstalledRelatedApps;
        await expect(queryRelatedAppInstalled()).resolves.toBeNull();
    });
});

describe("useInstallPrompt", () => {
    beforeEach(() => {
        localStorage.clear();
        apiMock.setDeviceInstallState.mockReset();
        apiMock.setDeviceInstallState.mockResolvedValue({ recorded: true });
        apiMock.user = { accessToken: "jwt" };
        mockMatchMedia();
        setUserAgent(ANDROID_UA);
        delete window.navigator.standalone;
        delete navigator.getInstalledRelatedApps;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("reports 'browser' to smartAuth from a tab", async () => {
        renderHook(() => useInstallPrompt());

        await waitFor(() => {
            expect(apiMock.setDeviceInstallState).toHaveBeenCalledWith("browser");
        });
    });

    it("reports 'standalone' and remembers it forever", async () => {
        mockMatchMedia(["standalone"]);

        const { result } = renderHook(() => useInstallPrompt());

        expect(result.current.isStandalone).toBe(true);
        expect(result.current.isInstalled).toBe(true);
        await waitFor(() => {
            expect(apiMock.setDeviceInstallState).toHaveBeenCalledWith("standalone");
        });

        // Next visit, from a browser tab this time: the app IS still
        // installed, the icon did not disappear from the home screen.
        mockMatchMedia();
        const second = renderHook(() => useInstallPrompt());
        expect(second.result.current.isStandalone).toBe(false);
        expect(second.result.current.isInstalled).toBe(true);
        expect(second.result.current.shouldOffer).toBe(false);
    });

    it("does not report when no user is authenticated", async () => {
        apiMock.user = null;
        renderHook(() => useInstallPrompt());

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(apiMock.setDeviceInstallState).not.toHaveBeenCalled();
    });

    it("stays silent until minVisits is reached", () => {
        const first = renderHook(() => useInstallPrompt({ minVisits: 2 }));
        act(() => {
            fireBeforeInstallPrompt();
        });
        expect(first.result.current.canPrompt).toBe(true);
        expect(first.result.current.shouldOffer).toBe(false);

        const second = renderHook(() => useInstallPrompt({ minVisits: 2 }));
        fireBeforeInstallPrompt();
        expect(second.result.current.shouldOffer).toBe(true);
    });

    it("offers nothing on a browser that can neither prompt nor be instructed", () => {
        setUserAgent(DESKTOP_UA);
        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0 }));

        // No beforeinstallprompt fired: Firefox/desktop Safari cannot install.
        expect(result.current.canPrompt).toBe(false);
        expect(result.current.needsManualInstructions).toBe(false);
        expect(result.current.shouldOffer).toBe(false);
    });

    it("offers manual instructions on iOS, where no native prompt exists", () => {
        setUserAgent(IPHONE_UA);
        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0 }));

        expect(result.current.canPrompt).toBe(false);
        expect(result.current.needsManualInstructions).toBe(true);
        expect(result.current.shouldOffer).toBe(true);
    });

    it("runs the native prompt and returns its outcome", async () => {
        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0 }));
        const event = fireBeforeInstallPrompt("accepted");

        let outcome;
        await act(async () => {
            outcome = await result.current.promptInstall();
        });

        expect(event.prompt).toHaveBeenCalled();
        expect(outcome).toBe("accepted");
        // Single-use: the browser re-fires the event if still installable.
        expect(result.current.canPrompt).toBe(false);
    });

    it("marks the app installed on the appinstalled event", async () => {
        const onInstalled = vi.fn();
        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0, onInstalled }));
        fireBeforeInstallPrompt();
        expect(result.current.shouldOffer).toBe(true);

        act(() => {
            window.dispatchEvent(new Event("appinstalled"));
        });

        expect(onInstalled).toHaveBeenCalled();
        expect(result.current.isInstalled).toBe(true);
        expect(result.current.shouldOffer).toBe(false);
    });

    it("keeps quiet for remindAfterDays after a refusal, then asks again", () => {
        vi.useFakeTimers();
        const mount = () => {
            const rendered = renderHook(() => useInstallPrompt({ minVisits: 0, remindAfterDays: 14 }));
            fireBeforeInstallPrompt();
            return rendered;
        };

        const first = mount();
        expect(first.result.current.shouldOffer).toBe(true);

        act(() => {
            first.result.current.dismiss();
        });
        // Gone immediately, without waiting for the next page load.
        expect(first.result.current.shouldOffer).toBe(false);
        first.unmount();

        // Comes back on a later visit, not mid-session: the delay is
        // read when the hook mounts.
        vi.advanceTimersByTime(13 * 24 * 60 * 60 * 1000);
        const tooEarly = mount();
        expect(tooEarly.result.current.shouldOffer).toBe(false);
        tooEarly.unmount();

        vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
        const dueAgain = mount();
        expect(dueAgain.result.current.shouldOffer).toBe(true);
    });

    it("stops asking after three refusals", () => {
        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0, remindAfterDays: 0 }));
        fireBeforeInstallPrompt();

        act(() => {
            result.current.dismiss();
        });
        act(() => {
            result.current.dismiss();
        });
        expect(JSON.parse(localStorage.getItem(INSTALL_STATE_KEY)).neverAsk).toBe(false);

        act(() => {
            result.current.dismiss();
        });
        expect(JSON.parse(localStorage.getItem(INSTALL_STATE_KEY)).neverAsk).toBe(true);
        expect(result.current.shouldOffer).toBe(false);
    });

    it("honours dismiss({ forever: true }) on the first refusal", () => {
        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0, remindAfterDays: 0 }));
        fireBeforeInstallPrompt();

        act(() => {
            result.current.dismiss({ forever: true });
        });

        expect(result.current.shouldOffer).toBe(false);
        expect(JSON.parse(localStorage.getItem(INSTALL_STATE_KEY)).neverAsk).toBe(true);
    });

    it("trusts getInstalledRelatedApps to hide the invitation on Android", async () => {
        navigator.getInstalledRelatedApps = vi.fn().mockResolvedValue([
            { platform: "webapp", url: "https://app.example.org/manifest.webmanifest" },
        ]);

        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0 }));
        fireBeforeInstallPrompt();

        await waitFor(() => {
            expect(result.current.isInstalled).toBe(true);
        });
        expect(result.current.shouldOffer).toBe(false);
    });

    it("survives a backend that does not know the endpoint yet", async () => {
        const err = new Error("Not Found");
        err.response = { status: 404 };
        apiMock.setDeviceInstallState.mockRejectedValue(err);

        const { result } = renderHook(() => useInstallPrompt({ minVisits: 0 }));
        fireBeforeInstallPrompt();

        await waitFor(() => {
            expect(apiMock.setDeviceInstallState).toHaveBeenCalled();
        });
        // Telemetry failure must not disable the invitation.
        expect(result.current.shouldOffer).toBe(true);
    });
});
