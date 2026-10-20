import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to detect and manage PWA updates via Service Worker.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoReload - Auto-reload when update is activated (default: false)
 * @param {number} options.checkInterval - Interval in ms to check for updates (default: 0 = disabled)
 * @param {Function} options.onUpdateAvailable - Callback when update is available
 * @param {Function} options.onUpdateActivated - Callback when update is activated
 * @param {string|null} options.versionUrl - JSON file describing the deployed build,
 *   `{ "version": "1.4.0", "notes": "..." }`, read when an update is detected.
 *   Resolved against the document base URL (default: "version.json", null to disable)
 * @returns {Object} { updateAvailable, updateActivated, newVersion, releaseNotes, checkForUpdates, applyUpdate }
 */
export const usePWAUpdate = (options = {}) => {
    const {
        autoReload = false,
        checkInterval = 0,
        onUpdateAvailable,
        onUpdateActivated,
        versionUrl = "version.json",
    } = options;

    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateActivated, setUpdateActivated] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [newVersion, setNewVersion] = useState(null);
    const [releaseNotes, setReleaseNotes] = useState(null);
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

    // Read the version of the build the waiting Service Worker carries. The
    // query parameter matters: projects precache every *.json, and Workbox
    // would otherwise answer with the version.json of the build still running.
    const fetchVersionInfo = useCallback(async () => {
        if (!versionUrl) {
            return;
        }

        try {
            const url = new URL(versionUrl, document.baseURI);
            url.searchParams.set("_", String(Date.now()));
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                console.warn(`[PWA] ${versionUrl} answered HTTP ${response.status}, new version number unknown`);
                return;
            }

            const data = await response.json();
            const version = data?.version;
            const notes = data?.notes;
            if (typeof version !== "string" && typeof version !== "number") {
                console.warn(`[PWA] ${versionUrl} has no "version" field`);
            }
            setNewVersion(typeof version === "string" || typeof version === "number" ? String(version) : null);
            setReleaseNotes(typeof notes === "string" && notes.trim() ? notes : null);
        } catch (error) {
            console.error(`[PWA] Could not read ${versionUrl}:`, error);
        }
    }, [versionUrl]);

    // Apply the pending update (skip waiting and reload)
    const applyUpdate = useCallback(() => {
        setIsApplying(true);
        const waitingWorker = waitingWorkerRef.current;

        if (waitingWorker) {
            // Tell waiting SW to skip waiting and take control
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
            // Give the SW time to activate, then reload
            setTimeout(() => {
                window.location.reload();
            }, 500);
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
                fetchVersionInfo();
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
                        fetchVersionInfo();
                        onUpdateAvailable?.();
                    }

                    // Listen for new updates
                    reg.addEventListener("updatefound", () => handleUpdateFound(reg));

                    // Ask the server now, instead of waiting for the first
                    // checkInterval tick. Without this the only check left is
                    // the one the browser runs on register(), and that one can
                    // be answered from the HTTP cache: a host serving the entry
                    // point with no Cache-Control lets the browser treat it as
                    // fresh for a tenth of its age (RFC 9111, 4.2.2), so an
                    // installed app opened a few minutes at a time never learns
                    // that a new version exists. Registered AFTER the
                    // updatefound listener above, otherwise a fast answer would
                    // fire the event before anything listens for it.
                    reg.update().catch((error) => {
                        console.error("[PWA] Initial update check failed:", error);
                    });
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
    }, [autoReload, checkInterval, checkForUpdates, fetchVersionInfo, onUpdateAvailable, onUpdateActivated]);

    return {
        updateAvailable,
        updateActivated,
        newVersion,
        releaseNotes,
        isApplying,
        registration,
        checkForUpdates,
        applyUpdate,
        reloadPage,
    };
};

export default usePWAUpdate;
