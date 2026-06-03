import { useCallback, useEffect, useRef, useState } from "react";

import { useApi } from "lib/hooks";
import { createLogger } from "lib/utils";

const log = createLogger("usePushNotifications");

/**
 * Convert a base64url string (VAPID public key) to a Uint8Array suitable for
 * PushManager.subscribe({ applicationServerKey }).
 *
 * @param {string} base64String
 * @returns {Uint8Array}
 */
const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

/**
 * Detect browser support for Web Push (Service Worker + Push API +
 * Notification API). Guarded so the hook never throws in a non-browser or
 * unsupported environment (SSR, old browsers, iOS without PWA install).
 *
 * @returns {boolean}
 */
const detectSupport = () =>
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window;

/**
 * usePushNotifications
 *
 * Manages the browser-side Web Push subscription lifecycle against the
 * smartAuth /push endpoints, consumed through the shared useApi client.
 *
 * Backend contract (source of truth: ~/dev/smartauth, spec_web_push.md):
 *   - GET    push/vapid-public-key (public)  -> { publicKey }
 *   - POST   push/subscribe                  -> { id, message }
 *   - DELETE push/unsubscribe                -> { message }
 *   - GET    push/subscriptions              -> { subscriptions: [...] }
 *
 * The hook degrades gracefully: if the browser lacks support, permission is
 * 'unsupported' and actions are no-ops; if the backend endpoints are missing
 * (404) or the Service Worker push handler is not wired yet, errors are
 * caught and logged rather than thrown.
 *
 * Public API:
 *   State:   permission ('default'|'granted'|'denied'|'unsupported'),
 *            isSubscribed, isLoading, error (string|null), subscriptions[]
 *   Actions: subscribe(label?) -> Promise<boolean>,
 *            unsubscribe() -> Promise<boolean>,
 *            refreshSubscriptions() -> Promise<void>
 *
 * @returns {{
 *   permission: ('default'|'granted'|'denied'|'unsupported'),
 *   isSubscribed: boolean,
 *   isLoading: boolean,
 *   error: (string|null),
 *   subscriptions: Array<object>,
 *   subscribe: (label?: string) => Promise<boolean>,
 *   unsubscribe: () => Promise<boolean>,
 *   refreshSubscriptions: () => Promise<void>,
 * }}
 */
export const usePushNotifications = () => {
    const api = useApi();

    // isSupported is stable for the lifetime of the page, capture it once.
    const isSupportedRef = useRef(detectSupport());
    const isSupported = isSupportedRef.current;

    const [permission, setPermission] = useState(
        isSupported ? Notification.permission : "unsupported"
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(isSupported);
    const [error, setError] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);

    const refreshSubscriptions = useCallback(async () => {
        try {
            const response = await api.get("push/subscriptions");
            if (response && Array.isArray(response.subscriptions)) {
                setSubscriptions(response.subscriptions);
            }
        } catch (err) {
            // Backend may not expose the endpoint yet, or the session may be
            // offline. Non-fatal: keep the previous list and log the reason.
            log.error("Failed to fetch push subscriptions", err);
        }
    }, [api]);

    const checkSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(subscription !== null);
        } catch (err) {
            log.error("Failed to read current push subscription", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial state: read permission and detect an existing subscription.
    useEffect(() => {
        if (!isSupported) {
            log.warning("Web Push not supported by this browser");
            return;
        }
        setPermission(Notification.permission);
        checkSubscription();
    }, [isSupported, checkSubscription]);

    // Service Worker subscription renewal: the SW cannot re-register the new
    // subscription server-side (no auth token in the SW), so it posts a
    // 'push-resubscribe' message and we replay the authenticated POST here.
    // See spec_web_push.md section 7/8.
    useEffect(() => {
        if (!isSupported) {
            return undefined;
        }
        // Capture the reference at install time so the cleanup never touches a
        // navigator.serviceWorker that disappeared in between.
        const sw = navigator.serviceWorker;
        const onMessage = (event) => {
            if (event.data?.type === "push-resubscribe" && event.data.subscription) {
                api
                    .post("push/subscribe", { json: { subscription: event.data.subscription } })
                    .catch((err) => log.error("Failed to replay push resubscribe", err));
            }
        };
        sw.addEventListener("message", onMessage);
        return () => sw.removeEventListener("message", onMessage);
    }, [api, isSupported]);

    const subscribe = useCallback(
        async (label) => {
            if (!isSupported) {
                log.error("subscribe() called but Web Push is not supported");
                setError("Push notifications are not supported by this browser");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                // 1. Ensure notification permission is granted.
                if (Notification.permission === "default") {
                    const result = await Notification.requestPermission();
                    setPermission(result);
                    if (result !== "granted") {
                        log.error(`Notification permission not granted: ${result}`);
                        setError("Permission denied");
                        return false;
                    }
                } else if (Notification.permission === "denied") {
                    log.error("Notification permission is blocked by the user");
                    setError("Notifications are blocked");
                    return false;
                }

                // 2. Fetch the VAPID public key (public, unauthenticated endpoint).
                const vapidResponse = await api.public.get("push/vapid-public-key").json();
                if (!vapidResponse?.publicKey) {
                    log.error("Server returned no VAPID public key");
                    setError("Server not configured for push");
                    return false;
                }

                // 3. Subscribe through the browser Push API.
                const applicationServerKey = urlBase64ToUint8Array(vapidResponse.publicKey);
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                });

                // 4. Persist the subscription server-side.
                const subscriptionJson = subscription.toJSON();
                await api.post("push/subscribe", {
                    json: {
                        subscription: {
                            endpoint: subscriptionJson.endpoint,
                            keys: {
                                p256dh: subscriptionJson.keys?.p256dh,
                                auth: subscriptionJson.keys?.auth,
                            },
                        },
                        label,
                    },
                });

                setIsSubscribed(true);
                await refreshSubscriptions();
                return true;
            } catch (err) {
                log.error("Push subscription failed", err);
                setError(err?.message || "Subscription failed");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [api, isSupported, refreshSubscriptions]
    );

    const unsubscribe = useCallback(async () => {
        if (!isSupported) {
            log.error("unsubscribe() called but Web Push is not supported");
            setError("Push notifications are not supported by this browser");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const { endpoint } = subscription;

                // Browser side: best-effort, log if it fails but still try the
                // backend so the two sides do not drift.
                try {
                    await subscription.unsubscribe();
                } catch (err) {
                    log.error("Browser unsubscribe failed", err);
                }

                // Backend side: remove the stored subscription.
                try {
                    await api.del("push/unsubscribe", { json: { endpoint } });
                } catch (err) {
                    log.error("Backend unsubscribe failed", err);
                }
            }

            setIsSubscribed(false);
            await refreshSubscriptions();
            return true;
        } catch (err) {
            log.error("Unsubscribe failed", err);
            setError(err?.message || "Unsubscribe failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [api, isSupported, refreshSubscriptions]);

    return {
        permission,
        isSubscribed,
        isLoading,
        error,
        subscriptions,
        subscribe,
        unsubscribe,
        refreshSubscriptions,
    };
};
