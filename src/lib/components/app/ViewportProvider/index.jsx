import { useMemo, useState } from "react";

import { log } from "lib/utils";

import {
    DESKTOP_MEDIA_QUERY,
    VIEWPORT_PREFERENCE_KEY,
    ViewportContext,
} from "./context";
import { DEFAULT_LABELS, propTypes } from "./props";

const VALID_PREFERENCES = ["auto", "desktop", "mobile"];

const readStoredPreference = () => {
    if (typeof window === "undefined") return "auto";
    try {
        const raw = window.localStorage?.getItem(VIEWPORT_PREFERENCE_KEY);
        if (raw && VALID_PREFERENCES.includes(raw)) return raw;
    } catch (e) {
        // Storage access can throw in private mode / sandboxed iframes.
        // Fall back to 'auto' silently, this is non-critical.
    }
    return "auto";
};

const detectAuto = () => {
    if (typeof window === "undefined") return "mobile";
    if (typeof window.matchMedia !== "function") return "mobile";
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches ? "desktop" : "mobile";
};

const resolveViewport = (preference) => {
    if (preference === "desktop") return "desktop";
    if (preference === "mobile") return "mobile";
    return detectAuto();
};

export const ViewportProvider = ({ children, labels, onPreferenceChange }) => {
    // Both values are computed ONCE at provider mount. No effect, no
    // listener: the viewport is intentionally frozen for the session.
    const [{ preference, viewport }] = useState(() => {
        const pref = readStoredPreference();
        return { preference: pref, viewport: resolveViewport(pref) };
    });

    const confirmReloadMessage =
        labels?.confirmReloadMessage ?? DEFAULT_LABELS.confirmReloadMessage;

    const setPreference = async (next) => {
        if (!VALID_PREFERENCES.includes(next)) {
            throw new Error(`Invalid viewport preference: ${next}`);
        }
        if (next === preference) return;

        const ok = typeof window !== "undefined"
            && typeof window.confirm === "function"
            && window.confirm(confirmReloadMessage);
        if (!ok) return;

        try {
            window.localStorage?.setItem(VIEWPORT_PREFERENCE_KEY, next);
        } catch (e) {
            // If storage is unavailable we still reload, but the choice
            // won't survive a future session.
        }

        if (typeof onPreferenceChange === "function") {
            try {
                await onPreferenceChange(next);
            } catch (err) {
                // Never block the reload on a consumer-side failure.
                log.error("ViewportProvider.onPreferenceChange threw", err);
            }
        }

        window.location.reload();
    };

    const value = useMemo(
        () => ({
            viewport,
            isMobile: viewport === "mobile",
            isDesktop: viewport === "desktop",
            preference,
            setPreference,
        }),
        // setPreference closes over `preference` which never changes during
        // the session; keeping it out of the deps avoids rebuilding the
        // value object on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [viewport, preference],
    );

    return (
        <ViewportContext.Provider value={value}>
            {children}
        </ViewportContext.Provider>
    );
};

ViewportProvider.propTypes = propTypes;
