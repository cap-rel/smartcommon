import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useContext } from "react";
import { render, renderHook, screen, act } from "@testing-library/react";

import { ViewportProvider, detectAutoViewport } from "./index";
import { DualShell } from "./DualShell";
import {
    ViewportContext,
    MOBILE_MAX_SHORT_SIDE_PX,
    VIEWPORT_PREFERENCE_KEY,
} from "./context";
import { useViewport } from "lib/hooks/global/useViewport";

// Configurable matchMedia stub. `matchers` is a map of media-query
// string -> boolean. Any query absent from the map returns false.
const stubMatchMedia = (matchers = {}) => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: matchers[query] === true,
        media: query,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }));
};

// Force window.screen to a specific size. happy-dom exposes a default
// 1024x768 screen; redefining via defineProperty lets each test pick
// its own physical screen dimensions.
const stubScreen = (width, height) => {
    Object.defineProperty(window, "screen", {
        configurable: true,
        value: { width, height },
    });
};

// Helper for the "fine pointer / desktop" shortcut.
const FINE = { "(pointer: fine)": true };

describe("ViewportProvider", () => {
    let originalReload;
    let originalConfirm;
    let originalMatchMedia;
    let originalScreenDescriptor;

    beforeEach(() => {
        window.localStorage.clear();
        originalReload = window.location.reload;
        originalConfirm = window.confirm;
        originalMatchMedia = window.matchMedia;
        originalScreenDescriptor = Object.getOwnPropertyDescriptor(window, "screen");
        // happy-dom's window.location.reload is read-only; replace via
        // delete + reassign to allow vi.fn() instrumentation.
        delete window.location.reload;
        window.location.reload = vi.fn();
    });

    afterEach(() => {
        window.location.reload = originalReload;
        window.confirm = originalConfirm;
        window.matchMedia = originalMatchMedia;
        if (originalScreenDescriptor) {
            Object.defineProperty(window, "screen", originalScreenDescriptor);
        }
        window.localStorage.clear();
        vi.restoreAllMocks();
    });

    // -------------------------------------------------------------
    // Auto-detect (3-tier)
    // -------------------------------------------------------------

    it("auto-detects mobile on iPhone (pointer:coarse + 390x844)", () => {
        stubMatchMedia({});
        stubScreen(390, 844);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("mobile");
        expect(result.current.isMobile).toBe(true);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.isDesktop).toBe(false);
    });

    it("auto-detects tablet on iPad (pointer:coarse + 1024x1366)", () => {
        stubMatchMedia({});
        stubScreen(1024, 1366);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("tablet");
        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(true);
        expect(result.current.isDesktop).toBe(false);
    });

    it("auto-detects desktop when pointer:fine matches (regardless of screen)", () => {
        stubMatchMedia(FINE);
        stubScreen(390, 844); // even a phone-sized screen
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("desktop");
        expect(result.current.isDesktop).toBe(true);
    });

    it("auto-detects tablet on iPad + Magic Keyboard (pointer:coarse + 820x1180)", () => {
        // iPadOS Safari reports `(pointer: fine) = false` even with a
        // Magic Keyboard because touch remains the primary pointer.
        // The trackpad is exposed via `(any-pointer: fine)` which we
        // intentionally do not consult.
        stubMatchMedia({});
        stubScreen(820, 1180);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("tablet");
    });

    it("auto-detects mobile on iPhone landscape (430x932) -- short-side wins over innerWidth", () => {
        // Historical trap: `innerWidth=932` looked like a desktop in
        // the `min-width: 768px` era. The new rule uses
        // `Math.min(screen.width, screen.height) = 430` < 600 -> mobile.
        stubMatchMedia({});
        stubScreen(430, 932);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("mobile");
    });

    // -------------------------------------------------------------
    // Stored preference
    // -------------------------------------------------------------

    it("honors a stored 'tablet' preference even when pointer:fine matches", () => {
        window.localStorage.setItem(VIEWPORT_PREFERENCE_KEY, "tablet");
        stubMatchMedia(FINE);
        stubScreen(1920, 1080);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("tablet");
        expect(result.current.preference).toBe("tablet");
    });

    it("setPreference('tablet') triggers confirm + reload + localStorage write", async () => {
        stubMatchMedia({});
        stubScreen(390, 844);
        window.confirm = vi.fn(() => true);
        const setItemSpy = vi.spyOn(window.localStorage, "setItem");

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });

        await act(async () => {
            await result.current.setPreference("tablet");
        });

        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(VIEWPORT_PREFERENCE_KEY, "tablet");
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it("setPreference('invalid') throws", async () => {
        stubMatchMedia({});
        stubScreen(390, 844);

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });

        await expect(
            act(async () => {
                await result.current.setPreference("phablet");
            }),
        ).rejects.toThrow(/Invalid viewport preference/);
    });

    // -------------------------------------------------------------
    // Edge cases
    // -------------------------------------------------------------

    it("falls back to mobile when matchMedia is absent", () => {
        delete window.matchMedia;
        stubScreen(1920, 1080);
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("mobile");
    });

    it("uses innerWidth/innerHeight when window.screen is unavailable", () => {
        // Some sandboxed iframes redact `window.screen`. We fall back
        // on `innerWidth`/`innerHeight`, still under coarse pointer.
        stubMatchMedia({});
        // Drop the screen object entirely.
        Object.defineProperty(window, "screen", {
            configurable: true,
            value: undefined,
        });
        // happy-dom innerWidth/innerHeight default to 1024/768; force
        // a tablet-sized window.
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 1200 });
        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });
        expect(result.current.viewport).toBe("tablet");
    });

    // -------------------------------------------------------------
    // setPreference / onPreferenceChange semantics (unchanged from 1.0.333)
    // -------------------------------------------------------------

    it("setPreference(same) returns early and does not reload", async () => {
        stubMatchMedia({});
        stubScreen(390, 844);
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

    it("setPreference(other) does nothing when user cancels the confirm", async () => {
        stubMatchMedia({});
        stubScreen(390, 844);
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
        stubMatchMedia({});
        stubScreen(390, 844);
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
        stubMatchMedia({});
        stubScreen(390, 844);
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
        stubMatchMedia({});
        stubScreen(390, 844);
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

    it("useViewport throws when used outside a ViewportProvider", () => {
        expect(() => renderHook(() => useViewport())).toThrow(
            /useViewport must be used inside <ViewportProvider>/,
        );
    });

    // -------------------------------------------------------------
    // silent setPreference (new in 1.0.335 phase 2)
    // -------------------------------------------------------------

    it("setPreference(other, { silent: true }) skips the confirm but reloads", async () => {
        stubMatchMedia({});
        stubScreen(390, 844);
        window.confirm = vi.fn(() => true);
        const setItemSpy = vi.spyOn(window.localStorage, "setItem");

        const { result } = renderHook(() => useContext(ViewportContext), {
            wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
        });

        await act(async () => {
            await result.current.setPreference("tablet", { silent: true });
        });

        expect(window.confirm).not.toHaveBeenCalled();
        expect(setItemSpy).toHaveBeenCalledWith(VIEWPORT_PREFERENCE_KEY, "tablet");
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it("setPreference with { silent: true } still awaits onPreferenceChange before reloading", async () => {
        stubMatchMedia({});
        stubScreen(390, 844);

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
            await result.current.setPreference("tablet", { silent: true });
        });

        expect(order).toEqual([
            "callback-start:tablet",
            "callback-end:tablet",
            "reload",
        ]);
    });
});

describe("detectAutoViewport", () => {
    let originalMatchMedia;
    let originalScreenDescriptor;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        originalScreenDescriptor = Object.getOwnPropertyDescriptor(window, "screen");
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        if (originalScreenDescriptor) {
            Object.defineProperty(window, "screen", originalScreenDescriptor);
        }
    });

    it("returns 'desktop' for pointer:fine regardless of screen", () => {
        stubMatchMedia(FINE);
        stubScreen(320, 480);
        expect(detectAutoViewport()).toBe("desktop");
    });

    it("returns 'tablet' for pointer:coarse + short side >= 600", () => {
        stubMatchMedia({});
        stubScreen(MOBILE_MAX_SHORT_SIDE_PX, 1024);
        expect(detectAutoViewport()).toBe("tablet");
    });

    it("returns 'mobile' for pointer:coarse + short side < 600", () => {
        stubMatchMedia({});
        stubScreen(MOBILE_MAX_SHORT_SIDE_PX - 1, 1024);
        expect(detectAutoViewport()).toBe("mobile");
    });
});

describe("DualShell", () => {
    let originalMatchMedia;
    let originalScreenDescriptor;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        originalScreenDescriptor = Object.getOwnPropertyDescriptor(window, "screen");
        window.localStorage.clear();
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        if (originalScreenDescriptor) {
            Object.defineProperty(window, "screen", originalScreenDescriptor);
        }
        window.localStorage.clear();
    });

    it("renders mobile branch when viewport is mobile", () => {
        stubMatchMedia({});
        stubScreen(390, 844);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>m</p>} tablet={<p>t</p>} desktop={<p>d</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("m")).toBeDefined();
        expect(screen.queryByText("t")).toBeNull();
        expect(screen.queryByText("d")).toBeNull();
    });

    it("renders tablet branch when viewport is tablet and tablet prop is provided", () => {
        stubMatchMedia({});
        stubScreen(1024, 1366);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>m</p>} tablet={<p>t</p>} desktop={<p>d</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("t")).toBeDefined();
    });

    it("falls back to desktop when viewport=tablet and tablet prop is missing", () => {
        stubMatchMedia({});
        stubScreen(1024, 1366);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>m</p>} desktop={<p>d</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("d")).toBeDefined();
        expect(screen.queryByText("m")).toBeNull();
    });

    it("falls back to mobile when viewport=tablet and neither tablet nor desktop prop is provided", () => {
        stubMatchMedia({});
        stubScreen(1024, 1366);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>m</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("m")).toBeDefined();
    });

    it("renders desktop branch when viewport is desktop", () => {
        stubMatchMedia(FINE);
        stubScreen(1920, 1080);
        render(
            <ViewportProvider>
                <DualShell mobile={<p>m</p>} tablet={<p>t</p>} desktop={<p>d</p>} />
            </ViewportProvider>,
        );
        expect(screen.getByText("d")).toBeDefined();
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
