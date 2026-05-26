import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useContext } from "react";
import { render, renderHook, screen, act } from "@testing-library/react";

import { ViewportProvider } from "./index";
import { DualShell } from "./DualShell";
import {
    ViewportContext,
    DESKTOP_MEDIA_QUERY,
    VIEWPORT_PREFERENCE_KEY,
} from "./context";
import { useViewport } from "lib/hooks/global/useViewport";

// Helpers to stub the few window APIs the provider relies on.
const stubMatchMedia = (matches) => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === DESKTOP_MEDIA_QUERY ? matches : false,
        media: query,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }));
};

describe("ViewportProvider", () => {
    let originalReload;
    let originalConfirm;
    let originalMatchMedia;

    beforeEach(() => {
        window.localStorage.clear();
        originalReload = window.location.reload;
        originalConfirm = window.confirm;
        originalMatchMedia = window.matchMedia;
        // happy-dom's window.location.reload is read-only; replace via
        // delete + reassign to allow vi.fn() instrumentation.
        delete window.location.reload;
        window.location.reload = vi.fn();
    });

    afterEach(() => {
        window.location.reload = originalReload;
        window.confirm = originalConfirm;
        window.matchMedia = originalMatchMedia;
        window.localStorage.clear();
        vi.restoreAllMocks();
    });

    it("resolves to mobile when matchMedia returns false", () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("mobile");
        expect(result.current.isMobile).toBe(true);
        expect(result.current.isDesktop).toBe(false);
        expect(result.current.preference).toBe("auto");
    });

    it("resolves to desktop when matchMedia returns true", () => {
        stubMatchMedia(true);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("desktop");
        expect(result.current.isDesktop).toBe(true);
        expect(result.current.isMobile).toBe(false);
    });

    it("honors a stored 'desktop' preference even if matchMedia returns false", () => {
        window.localStorage.setItem(VIEWPORT_PREFERENCE_KEY, "desktop");
        stubMatchMedia(false);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("desktop");
        expect(result.current.preference).toBe("desktop");
    });

    it("useViewport throws when used outside a ViewportProvider", () => {
        // Render an isolated hook (no provider). React's renderHook bubbles
        // the throw, so we wrap it in expect().toThrow.
        expect(() => renderHook(() => useViewport())).toThrow(
            /useViewport must be used inside <ViewportProvider>/,
        );
    });

    it("setPreference(same) returns early and does not reload", async () => {
        stubMatchMedia(false);
        window.confirm = vi.fn(() => true);
        const setItemSpy = vi.spyOn(window.localStorage, "setItem");

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        // Current preference is "auto" (no stored value).
        await act(async () => {
            await result.current.setPreference("auto");
        });

        expect(window.confirm).not.toHaveBeenCalled();
        expect(setItemSpy).not.toHaveBeenCalled();
        expect(window.location.reload).not.toHaveBeenCalled();
    });

    it("setPreference(other) triggers confirm, writes localStorage and reloads", async () => {
        stubMatchMedia(false);
        window.confirm = vi.fn(() => true);
        const setItemSpy = vi.spyOn(window.localStorage, "setItem");

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });

        await act(async () => {
            await result.current.setPreference("desktop");
        });

        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(VIEWPORT_PREFERENCE_KEY, "desktop");
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it("setPreference(other) does nothing when user cancels the confirm", async () => {
        stubMatchMedia(false);
        window.confirm = vi.fn(() => false);
        const setItemSpy = vi.spyOn(window.localStorage, "setItem");

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });

        await act(async () => {
            await result.current.setPreference("desktop");
        });

        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(setItemSpy).not.toHaveBeenCalled();
        expect(window.location.reload).not.toHaveBeenCalled();
    });

    it("setPreference awaits onPreferenceChange before reloading", async () => {
        stubMatchMedia(false);
        window.confirm = vi.fn(() => true);

        const order = [];
        const onPreferenceChange = vi.fn(async (next) => {
            order.push(`callback-start:${next}`);
            await new Promise((r) => setTimeout(r, 5));
            order.push(`callback-end:${next}`);
        });
        window.location.reload = vi.fn(() => order.push("reload"));

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => (
                <ViewportProvider onPreferenceChange={onPreferenceChange}>
                    {children}
                </ViewportProvider>
            ),
        });

        await act(async () => {
            await result.current.setPreference("desktop");
        });

        expect(onPreferenceChange).toHaveBeenCalledWith("desktop");
        expect(order).toEqual([
            "callback-start:desktop",
            "callback-end:desktop",
            "reload",
        ]);
    });

    it("setPreference still reloads when onPreferenceChange throws", async () => {
        stubMatchMedia(false);
        window.confirm = vi.fn(() => true);

        const onPreferenceChange = vi.fn(async () => {
            throw new Error("consumer-side failure");
        });

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => (
                <ViewportProvider onPreferenceChange={onPreferenceChange}>
                    {children}
                </ViewportProvider>
            ),
        });

        await act(async () => {
            await result.current.setPreference("desktop");
        });

        expect(onPreferenceChange).toHaveBeenCalled();
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it("uses labels.confirmReloadMessage when labels prop is provided", async () => {
        stubMatchMedia(false);
        window.confirm = vi.fn(() => false);

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => (
                <ViewportProvider labels={{ confirmReloadMessage: "FRENCH MSG" }}>
                    {children}
                </ViewportProvider>
            ),
        });

        await act(async () => {
            await result.current.setPreference("desktop");
        });

        expect(window.confirm).toHaveBeenCalledWith("FRENCH MSG");
    });
});

describe("DualShell", () => {
    let originalMatchMedia;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        window.localStorage.clear();
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        window.localStorage.clear();
    });

    it("renders the mobile branch when viewport is mobile", () => {
        stubMatchMedia(false);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>mobile-view</p>} desktop={<p>desktop-view</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("mobile-view")).toBeDefined();
        expect(screen.queryByText("desktop-view")).toBeNull();
    });

    it("renders the desktop branch when viewport is desktop", () => {
        stubMatchMedia(true);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>mobile-view</p>} desktop={<p>desktop-view</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("desktop-view")).toBeDefined();
        expect(screen.queryByText("mobile-view")).toBeNull();
    });

    it("throws when used outside a ViewportProvider", () => {
        // React logs the thrown error to console; silence it for this test.
        const originalError = console.error;
        console.error = () => {};
        try {
            expect(() => render(<DualShell mobile={<p>m</p>} desktop={<p>d</p>} />))
                .toThrow(/DualShell must be used inside <ViewportProvider>/);
        } finally {
            console.error = originalError;
        }
    });
});
