import { useEffect, useState } from "react";

/**
 * Resolve the effective dark state from a theme mode.
 *
 * mode: "light" | "dark" | "auto"
 *  - "light" -> always false
 *  - "dark"  -> always true
 *  - "auto"  -> follows the OS prefers-color-scheme, reacting to changes
 */
const useResolvedDark = (mode) => {
    const readOsDark = () =>
        typeof window !== "undefined" && typeof window.matchMedia === "function"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : false;

    const [osDark, setOsDark] = useState(readOsDark);

    useEffect(() => {
        if (mode !== "auto" || typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => setOsDark(e.matches);
        // Re-sync on (re)subscription in case the OS changed while not in auto.
        setOsDark(mq.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [mode]);

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
