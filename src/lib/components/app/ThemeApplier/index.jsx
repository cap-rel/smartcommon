import { useEffect, useSyncExternalStore } from "react";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const matchMediaSupported = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function";

/**
 * prefers-color-scheme as an external store. Reading it through
 * useSyncExternalStore keeps the subscription and the value in one place:
 * the previous version mirrored the media query into state and had to re-sync
 * it from the effect on every (re)subscription, which cost an extra render
 * pass and could show one frame of the wrong theme.
 */
const subscribeToOsDark = (onStoreChange) => {
    if (!matchMediaSupported()) {
        return () => {};
    }

    const mq = window.matchMedia(DARK_QUERY);
    mq.addEventListener("change", onStoreChange);
    return () => mq.removeEventListener("change", onStoreChange);
};

const getOsDark = () => (matchMediaSupported() ? window.matchMedia(DARK_QUERY).matches : false);

// No media queries server-side: render light and let the client correct it.
const getOsDarkServer = () => false;

/**
 * Resolve the effective dark state from a theme mode.
 *
 * mode: "light" | "dark" | "auto"
 *  - "light" -> always false
 *  - "dark"  -> always true
 *  - "auto"  -> follows the OS prefers-color-scheme, reacting to changes
 */
const useResolvedDark = (mode) => {
    const osDark = useSyncExternalStore(subscribeToOsDark, getOsDark, getOsDarkServer);

    if (mode === "dark") return true;
    if (mode === "auto") return osDark;
    return false;
};

/**
 * ThemeApplier toggles the `.dark` class on <html> according to `mode`.
 * Mounted by <Provider>; renders nothing. Defaults to "light" so apps that
 * do not configure a theme keep their current (light) appearance.
 */
export const ThemeApplier = ({ mode = "light", target }) => {
    const isDark = useResolvedDark(mode);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = target || document.documentElement;
        root.classList.toggle("dark", isDark);
    }, [isDark, target]);

    return null;
};
