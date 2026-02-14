import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to detect and manage PWA updates via Service Worker.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoReload - Auto-reload when update is activated (default: false)
 * @param {number} options.checkInterval - Interval in ms to check for updates (default: 0 = disabled)
 * @param {Function} options.onUpdateAvailable - Callback when update is available
 * @param {Function} options.onUpdateActivated - Callback when update is activated
 * @returns {Object} { updateAvailable, updateActivated, checkForUpdates, applyUpdate }
 */
export const usePWAUpdate = (options = {}) => {
    const {
        autoReload = false,
        checkInterval = 0,
        onUpdateAvailable,
        onUpdateActivated,
    } = options;

    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateActivated, setUpdateActivated] = useState(false);
    const [registration, setRegistration] = useState(null);
    const waitingWorkerRef = useRef(null);

    // Check for updates manually
    const checkForUpdates = useCallback(async () => {
        if (!("serviceWorker" in navigator)) {
            return false;
        }

        try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
                await reg.update();
                return true;
            }
        } catch (error) {
            console.error("[PWA] Update check failed:", error);
        }
        return false;
    }, []);

    // Apply the pending update (skip waiting and reload)
    const applyUpdate = useCallback(() => {
        const waitingWorker = waitingWorkerRef.current;

        if (waitingWorker) {
            // Tell waiting SW to skip waiting and take control
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
        } else {
            // No waiting worker, just reload
            window.location.reload();
        }
    }, []);

    // Reload the page
    const reloadPage = useCallback(() => {
        window.location.reload();
    }, []);

    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        let intervalId = null;

        const handleControllerChange = () => {
            // New SW has taken control
            setUpdateActivated(true);
            onUpdateActivated?.();

            if (autoReload) {
                window.location.reload();
            }
        };

        const handleStateChange = (event) => {
            const sw = event.target;
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
                // New SW installed and waiting
                waitingWorkerRef.current = sw;
                setUpdateAvailable(true);
                onUpdateAvailable?.();
            }
        };

        const handleUpdateFound = (reg) => {
            const newWorker = reg.installing;
            if (newWorker) {
                newWorker.addEventListener("statechange", handleStateChange);
            }
        };

        const init = async () => {
            try {
                const reg = await navigator.serviceWorker.getRegistration();

                if (reg) {
                    setRegistration(reg);

                    // Check if there's already a waiting worker
                    if (reg.waiting) {
                        waitingWorkerRef.current = reg.waiting;
                        setUpdateAvailable(true);
                        onUpdateAvailable?.();
                    }

                    // Listen for new updates
                    reg.addEventListener("updatefound", () => handleUpdateFound(reg));
                }

                // Listen for controller changes (new SW activated)
                navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

                // Setup periodic check if configured
                if (checkInterval > 0) {
                    intervalId = setInterval(checkForUpdates, checkInterval);
                }
            } catch (error) {
                console.error("[PWA] Init failed:", error);
            }
        };

        init();

        return () => {
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [autoReload, checkInterval, checkForUpdates, onUpdateAvailable, onUpdateActivated]);

    return {
        updateAvailable,
        updateActivated,
        registration,
        checkForUpdates,
        applyUpdate,
        reloadPage,
    };
};

export default usePWAUpdate;
