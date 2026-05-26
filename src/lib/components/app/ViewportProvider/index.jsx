import { useMemo, useState } from "react";

import { log } from "lib/utils";

import {
    DESKTOP_MEDIA_QUERY,
    MOBILE_MAX_SHORT_SIDE_PX,
    VIEWPORT_PREFERENCE_KEY,
    ViewportContext,
} from "./context";
import { DEFAULT_LABELS, propTypes } from "./props";

const VALID_PREFERENCES = ["auto", "mobile", "tablet", "desktop"];

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

// Public helper, exported so callers (DeviceIdentificationComponent,
// settings panels...) can preselect a UI control without recomputing
// the heuristic. Keep in sync with `resolveViewport` below.
export const detectAutoViewport = () => {
    if (typeof window === "undefined") return "mobile";
    if (typeof window.matchMedia !== "function") return "mobile";

    // Primary discriminator: pointer type. Fine pointer (mouse / trackpad)
    // means desktop UI semantics no matter the screen size. We
    // intentionally rely on `(pointer: fine)` (the PRIMARY pointer) and
    // NOT `(any-pointer: fine)`: an iPad with Magic Keyboard reports
    // `(pointer: fine) = false` because touch remains primary, so it
    // correctly stays in tablet mode. If Apple ever inverts this
    // contract, iPad+keyboard would slide to desktop -- we accept that
    // risk over the larger risk of misclassifying every iPad+keyboard
    // user today.
    if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) return "desktop";

    // Coarse pointer path: split mobile vs tablet by physical screen
    // short side (CSS px). `screen.width/height` is the device size, more
    // stable than `window.innerWidth` which depends on the viewport.
    const w = window.screen?.width ?? window.innerWidth ?? 0;
    const h = window.screen?.height ?? window.innerHeight ?? 0;
    const shortSide = Math.min(w, h);

    return shortSide >= MOBILE_MAX_SHORT_SIDE_PX ? "tablet" : "mobile";
};

const resolveViewport = (preference) => {
    if (preference === "desktop") return "desktop";
    if (preference === "tablet") return "tablet";
    if (preference === "mobile") return "mobile";
    return detectAutoViewport();
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

    // setPreference(next, { silent }):
    //   silent=false (default) -> ask the user to confirm before reload
    //   silent=true            -> skip the confirm (used right after
    //                             DeviceIdentificationComponent where
    //                             the user has just made the choice
    //                             via the device picker)
    const setPreference = async (next, options = {}) => {
        if (!VALID_PREFERENCES.includes(next)) {
            throw new Error(`Invalid viewport preference: ${next}`);
        }
        if (next === preference) return;

        const { silent = false } = options;
        if (!silent) {
            const ok = typeof window !== "undefined"
                && typeof window.confirm === "function"
                && window.confirm(confirmReloadMessage);
            if (!ok) return;
        }

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
            isTablet: viewport === "tablet",
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
