import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useApi } from "lib/hooks";
import { createLogger, getLocal, setLocal } from "lib/utils";

import {
    INSTALL_MODE_BROWSER,
    INSTALL_MODE_STANDALONE,
    detectPlatform,
    detectStandalone,
    needsManualInstall,
    queryRelatedAppInstalled,
} from "./detect";

const log = createLogger("useInstallPrompt");

/** Remembers, per browser profile, what we already know and what the user answered. */
export const INSTALL_STATE_KEY = "smartcommon.install.state";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Three refusals mean no: asking a fourth time is nagging. */
const MAX_REFUSALS = 3;

const readState = () => {
    const stored = getLocal(INSTALL_STATE_KEY);
    return {
        everStandalone: stored?.everStandalone === true,
        dismissedAt: typeof stored?.dismissedAt === "number" ? stored.dismissedAt : 0,
        dismissCount: typeof stored?.dismissCount === "number" ? stored.dismissCount : 0,
        neverAsk: stored?.neverAsk === true,
        visits: typeof stored?.visits === "number" ? stored.visits : 0,
    };
};

/**
 * useInstallPrompt
 *
 * Tells whether the PWA is installed on this device and drives the
 * "install the app" invitation.
 *
 * WHAT CAN AND CANNOT BE KNOWN. Nothing in an HTTP request says the app
 * is installed; only the client can tell, and only partially:
 *   - Android / desktop Chromium: `beforeinstallprompt` fires when the
 *     app is installable and NOT installed -> a reliable negative, plus
 *     a native prompt we can trigger from a user gesture.
 *   - iOS: no such event, ever. The only signal is
 *     `navigator.standalone` / `display-mode`, which requires the app to
 *     be running from the home screen AT THAT MOMENT. Installation can
 *     therefore only be learnt, never observed on demand - so it is
 *     remembered (localStorage here, `install_mode` server-side) and
 *     never forgotten.
 *
 * Consequence: `isInstalled` is a monotonic "we have seen it installed
 * at least once", not a live fact. A user who clears their site data
 * looks uninstalled again. That is the best any web app can do.
 *
 * Everything read from storage is sampled ONCE at mount, like the
 * viewport tier: a visit does not become older while it is open, and a
 * banner that pops up mid-session because a timer expired would be
 * worse than one that waits for the next launch.
 *
 * @param {Object} [options]
 * @param {number} [options.remindAfterDays=14] days before re-offering after a dismissal
 * @param {number} [options.minVisits=2] visits before the first invitation (0 = offer immediately)
 * @param {boolean} [options.report=true] report the install state to smartAuth
 * @param {Function} [options.onInstalled] called when the app gets installed during this session
 *
 * @returns {{
 *   isStandalone: boolean,
 *   isInstalled: boolean,
 *   canPrompt: boolean,
 *   needsManualInstructions: boolean,
 *   platform: ("ios"|"android"|"desktop"|"unknown"),
 *   shouldOffer: boolean,
 *   promptInstall: () => Promise<"accepted"|"dismissed"|"unavailable">,
 *   dismiss: (options?: { forever?: boolean }) => void,
 *   reset: () => void,
 * }}
 */
export const useInstallPrompt = (options = {}) => {
    const {
        remindAfterDays = 14,
        minVisits = 2,
        report = true,
        onInstalled,
    } = options;

    const api = useApi();

    const [platform] = useState(detectPlatform);
    const [isStandalone] = useState(detectStandalone);

    // Snapshot of the stored state for THIS visit, including whether the
    // snooze has expired - computed here so no impure clock read happens
    // during a later render.
    const [visit] = useState(() => {
        const stored = readState();
        return {
            visits: stored.visits + 1,
            everStandalone: stored.everStandalone,
            snoozeExpired: stored.dismissedAt === 0
                || Date.now() >= stored.dismissedAt + remindAfterDays * DAY_MS,
            neverAsk: stored.neverAsk,
        };
    });

    // What the user answered, starting from what they had answered before.
    const [refusal, setRefusal] = useState(() => ({
        snoozed: !visit.snoozeExpired,
        neverAsk: visit.neverAsk,
    }));

    const [relatedAppInstalled, setRelatedAppInstalled] = useState(false);
    const [canPrompt, setCanPrompt] = useState(false);
    const [justInstalled, setJustInstalled] = useState(false);

    const deferredPromptRef = useRef(null);
    const onInstalledRef = useRef(onInstalled);
    useLayoutEffect(() => {
        onInstalledRef.current = onInstalled;
    });

    // Bump the visit counter and remember a standalone launch. Writes to
    // storage only: `visit` already holds the values this render needs,
    // so there is nothing to set back into React state.
    useEffect(() => {
        const current = readState();
        setLocal(INSTALL_STATE_KEY, {
            ...current,
            visits: visit.visits,
            everStandalone: current.everStandalone || isStandalone,
        });
        if (isStandalone && !current.everStandalone) {
            log.info("running installed, remembering it");
        }
    }, [visit.visits, isStandalone]);

    // Chromium only: capture the native prompt instead of letting the
    // browser show its own mini-infobar, so the invitation appears where
    // the app decides. Its mere arrival proves the app is NOT installed.
    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const onBeforeInstallPrompt = (event) => {
            event.preventDefault();
            deferredPromptRef.current = event;
            setCanPrompt(true);
        };

        const onAppInstalled = () => {
            deferredPromptRef.current = null;
            setCanPrompt(false);
            setJustInstalled(true);
            setLocal(INSTALL_STATE_KEY, {
                ...readState(),
                everStandalone: true,
                dismissedAt: 0,
                neverAsk: false,
            });
            log.info("app installed");
            onInstalledRef.current?.();
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onAppInstalled);
        };
    }, []);

    // Android/Chromium can answer "already installed" from a browser tab.
    // Never answers "not installed" (see queryRelatedAppInstalled).
    useEffect(() => {
        let cancelled = false;

        queryRelatedAppInstalled().then((installed) => {
            if (cancelled || installed !== true) return;
            setRelatedAppInstalled(true);
            setLocal(INSTALL_STATE_KEY, { ...readState(), everStandalone: true });
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const isInstalled = isStandalone
        || justInstalled
        || relatedAppInstalled
        || visit.everStandalone;

    // Report to smartAuth, once per session and only when authenticated.
    // The server keeps the value monotonic, so a browser report can never
    // erase a past standalone one.
    const reportedRef = useRef(false);
    useEffect(() => {
        if (!report || reportedRef.current) return;
        if (!api?.user?.accessToken || typeof api.setDeviceInstallState !== "function") return;

        reportedRef.current = true;
        const mode = isStandalone ? INSTALL_MODE_STANDALONE : INSTALL_MODE_BROWSER;
        api.setDeviceInstallState(mode).catch((err) => {
            // Never surfaced to the user: this is telemetry, the app works
            // without it. An old backend simply 404s here.
            log.warning("could not report install state", mode, err);
            reportedRef.current = false;
        });
    }, [api, report, isStandalone]);

    const recordRefusal = useCallback((forever) => {
        const current = readState();
        const dismissCount = current.dismissCount + 1;
        const neverAsk = forever || dismissCount >= MAX_REFUSALS;
        setLocal(INSTALL_STATE_KEY, {
            ...current,
            dismissedAt: Date.now(),
            dismissCount,
            neverAsk,
        });
        setRefusal({ snoozed: true, neverAsk });
    }, []);

    const promptInstall = useCallback(async () => {
        const deferred = deferredPromptRef.current;
        if (!deferred) {
            log.warning("promptInstall called without a deferred prompt");
            return "unavailable";
        }

        try {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;

            // A deferred prompt is single-use: the browser fires a fresh
            // beforeinstallprompt if the app stays installable.
            deferredPromptRef.current = null;
            setCanPrompt(false);

            if (outcome === "accepted") {
                // `appinstalled` follows and does the bookkeeping.
                log.info("install accepted");
                return "accepted";
            }

            log.info("install dismissed from the native prompt");
            recordRefusal(false);
            return "dismissed";
        } catch (err) {
            log.error("native install prompt failed", err);
            return "unavailable";
        }
    }, [recordRefusal]);

    const dismiss = useCallback((dismissOptions = {}) => {
        recordRefusal(dismissOptions.forever === true);
    }, [recordRefusal]);

    const reset = useCallback(() => {
        setLocal(INSTALL_STATE_KEY, {
            ...readState(),
            dismissedAt: 0,
            dismissCount: 0,
            neverAsk: false,
        });
        setRefusal({ snoozed: false, neverAsk: false });
    }, []);

    const shouldOffer = useMemo(() => {
        if (isInstalled) return false;
        if (refusal.neverAsk || refusal.snoozed) return false;
        if (visit.visits < minVisits) return false;

        // Nothing to offer: no native prompt available and no manual
        // instructions worth showing (a desktop Firefox cannot install).
        if (!canPrompt && !needsManualInstall(platform)) return false;

        return true;
    }, [isInstalled, refusal, visit.visits, minVisits, canPrompt, platform]);

    return {
        isStandalone,
        isInstalled,
        canPrompt,
        needsManualInstructions: needsManualInstall(platform),
        platform,
        shouldOffer,
        promptInstall,
        dismiss,
        reset,
    };
};

export { INSTALL_MODE_BROWSER, INSTALL_MODE_STANDALONE, detectPlatform, detectStandalone };

export default useInstallPrompt;
