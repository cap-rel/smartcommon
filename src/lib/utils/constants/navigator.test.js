import { describe, it, expect, vi, afterEach } from "vitest";

// navigatorInfo is computed when the module loads: each test sets the
// browser state first, then imports a fresh copy.
const loadNavigatorInfo = async () => {
    vi.resetModules();
    const mod = await import("./navigator");
    return mod.navigatorInfo;
};

const stubNavigator = (props) => {
    for (const [key, value] of Object.entries(props)) {
        vi.spyOn(window.navigator, key, "get").mockReturnValue(value);
    }
};

describe("navigatorInfo", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("reports a desktop browser as desktop, not mobile", async () => {
        stubNavigator({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36" });
        expect((await loadNavigatorInfo()).device.type).toBe("desktop");
    });

    it("reports a phone as mobile and a tablet as tablet", async () => {
        stubNavigator({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36" });
        expect((await loadNavigatorInfo()).device.type).toBe("mobile");

        stubNavigator({ userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15" });
        expect((await loadNavigatorInfo()).device.type).toBe("tablet");
    });

    it("reads the browser language", async () => {
        stubNavigator({ language: "fr-FR" });
        expect((await loadNavigatorInfo()).language).toBe("fr-FR");
    });

    it("starts offline when the browser is offline, and follows the events", async () => {
        stubNavigator({ onLine: false });
        const info = await loadNavigatorInfo();
        expect(info.isOnLine).toBe(false);

        window.dispatchEvent(new Event("online"));
        expect(info.isOnLine).toBe(true);
        window.dispatchEvent(new Event("offline"));
        expect(info.isOnLine).toBe(false);
    });

    it("starts online when the browser is online", async () => {
        stubNavigator({ onLine: true });
        expect((await loadNavigatorInfo()).isOnLine).toBe(true);
    });
});
