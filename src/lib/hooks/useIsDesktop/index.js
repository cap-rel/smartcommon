import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

const subscribe = (onStoreChange) => {
    if (typeof window === "undefined") {
        return () => {};
    }

    const mediaQuery = window.matchMedia(DESKTOP_QUERY);

    // Modern browsers
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", onStoreChange);
        return () => mediaQuery.removeEventListener("change", onStoreChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(onStoreChange);
    return () => mediaQuery.removeListener(onStoreChange);
};

const getSnapshot = () =>
    typeof window === "undefined" ? false : window.matchMedia(DESKTOP_QUERY).matches;

// No viewport server-side: report mobile and let the client correct it.
const getServerSnapshot = () => false;

/**
 * Hook to detect if the screen is desktop size (>= 1024px)
 * Uses matchMedia for reactive updates on window resize.
 *
 * Read through useSyncExternalStore so the value comes straight from the media
 * query on every render: mirroring it into state meant the subscription effect
 * had to re-publish the initial value, costing an extra render on mount.
 */
export const useIsDesktop = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default useIsDesktop;
