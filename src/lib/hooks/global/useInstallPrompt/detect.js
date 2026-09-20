/**
 * Pure detection helpers for the PWA install state.
 *
 * Kept out of the hook so they can be unit-tested against fake globals
 * without rendering anything, and reused by consumers that only need the
 * answer (an "install the app" entry in a settings page, for instance).
 */

export const INSTALL_MODE_BROWSER = "browser";
export const INSTALL_MODE_STANDALONE = "standalone";

/**
 * Is the current session running as an installed app?
 *
 * Three independent signals, because no single one covers every OS:
 *  - display-mode media queries: the standard, honoured by Chromium and
 *    by Safari since iOS 17. `minimal-ui` / `fullscreen` count as
 *    installed too, they are manifest display modes, not browser tabs.
 *  - navigator.standalone: non-standard, but the ONLY signal on iOS
 *    before 17, and still present.
 *  - an `android-app://` referrer: the page was opened by the Android
 *    wrapper (TWA).
 *
 * WARNING: a false answer means "this session runs in a browser tab",
 * NOT "the app is not installed". The user may well have the icon on
 * their home screen and be visiting the URL from a browser right now.
 *
 * @returns {boolean}
 */
export const detectStandalone = () => {
    if (typeof window === "undefined") return false;

    if (typeof window.matchMedia === "function") {
        const modes = ["standalone", "minimal-ui", "fullscreen"];
        for (const mode of modes) {
            try {
                if (window.matchMedia(`(display-mode: ${mode})`).matches) return true;
            } catch {
                // Very old browsers throw on an unknown media feature.
            }
        }
    }

    if (window.navigator?.standalone === true) return true;

    if (typeof document !== "undefined" && typeof document.referrer === "string") {
        if (document.referrer.startsWith("android-app://")) return true;
    }

    return false;
};

/**
 * Coarse platform bucket, used to pick the right install path:
 * Android/desktop Chromium get a native prompt, iOS only gets manual
 * instructions ("Share -> Add to Home Screen").
 *
 * iPadOS 13+ lies in its user agent (it claims to be a Mac), hence the
 * maxTouchPoints check.
 *
 * @returns {"ios"|"android"|"desktop"|"unknown"}
 */
export const detectPlatform = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return "unknown";

    const ua = (navigator.userAgent || "").toLowerCase();

    if (/iphone|ipod/.test(ua)) return "ios";
    if (/ipad/.test(ua)) return "ios";
    // iPadOS 13+ reports a desktop Safari UA; touch points give it away.
    if (/macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1) return "ios";

    if (/android/.test(ua)) return "android";

    if (/mobile|tablet/.test(ua)) return "unknown";

    return "desktop";
};

/**
 * Does this browser require manual "add to home screen" steps?
 *
 * True for every iOS browser: Safari never fires beforeinstallprompt,
 * and Chrome/Firefox on iOS are Safari underneath, so they cannot
 * install either - only Safari's own share sheet can.
 *
 * @param {string} platform value returned by detectPlatform()
 * @returns {boolean}
 */
export const needsManualInstall = (platform) => platform === "ios";

/**
 * Ask the browser whether THIS web app is already installed, from a
 * plain browser tab. Chromium only (Android, and desktop since 2023),
 * and only if the manifest lists itself in `related_applications` with
 * platform "webapp":
 *
 *   "related_applications": [
 *       { "platform": "webapp", "url": "https://app.example.org/manifest.webmanifest" }
 *   ],
 *   "prefer_related_applications": false
 *
 * An empty array is NOT a reliable "not installed": a manifest without
 * that entry answers exactly the same thing. So this only ever returns
 * true (certain) or null (cannot tell) - never false. The "not
 * installed" verdict comes from beforeinstallprompt instead, which only
 * fires for an app the browser considers installable and not yet
 * installed.
 *
 * @returns {Promise<true|null>} true when known installed, null otherwise
 */
export const queryRelatedAppInstalled = async () => {
    if (typeof navigator === "undefined") return null;
    if (typeof navigator.getInstalledRelatedApps !== "function") return null;

    try {
        const apps = await navigator.getInstalledRelatedApps();
        if (!Array.isArray(apps)) return null;
        return apps.some((app) => app?.platform === "webapp") ? true : null;
    } catch {
        // Non-secure context, or the call is not allowed here.
        return null;
    }
};
