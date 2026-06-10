// Shared Web Push handlers for SmartMaker Service Workers.
//
// IMPORTANT: this module runs in the SERVICE WORKER global scope, NOT in the
// React app context. It must stay PURE JS with ZERO dependencies (no React, no
// other smartcommon module): it is imported by each project's src/sw.js, which
// is built by vite-plugin-pwa in 'injectManifest' mode (a separate rollup
// build). Pulling in the React bundle here would bloat and break the SW.
//
// It is exposed via the package subpath export "@cap-rel/smartcommon/sw" so a
// consumer SW reduces to:
//
//   import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
//   import { registerPushHandlers } from "@cap-rel/smartcommon/sw";
//   precacheAndRoute(self.__WB_MANIFEST);
//   cleanupOutdatedCaches();
//   registerPushHandlers({ defaultTitle: "MyApp" });
//
// The handlers mirror the SmartAuth push payload (spec_web_push.md section 8)
// and the smartcommon usePushNotifications hook contract: on a forced
// subscription renewal the SW posts a 'push-resubscribe' message and the hook
// replays the authenticated POST /push/subscribe (the SW has no auth token).
//
// Silent-sync pushes: when a push payload carries `data.action === "sync"`, the
// SW posts a 'trigger-sync' message to every open client (so the app can refresh
// its local state without the user acting) AND, if a client is already focused /
// visible, suppresses the system notification (the list refreshes live, so a
// banner would be redundant). When no client is focused the notification is
// still shown so the user does not miss the update. Pushes without
// `data.action === "sync"` keep the previous behaviour unchanged (always shown,
// no message posted).

/**
 * @typedef {Object} RegisterPushHandlersOptions
 * @property {string} [defaultTitle="Notification"] Title used when the push
 *   payload omits one (or is not valid JSON).
 * @property {string} [defaultIcon="/images/pwa-192x192.png"] Icon used when the
 *   payload omits `icon`. The payload value always takes precedence.
 * @property {string} [defaultBadge="/images/pwa-64x64.png"] Badge used when the
 *   payload omits `badge`.
 * @property {Array<number>} [vibrate=[200,100,200]] Vibration pattern.
 */

/**
 * Register the push, notificationclick, notificationclose and
 * pushsubscriptionchange listeners on the current Service Worker global scope.
 *
 * Safe to call once at the top level of a Service Worker. Does nothing (and
 * warns) if called outside a Service Worker context.
 *
 * @param {RegisterPushHandlersOptions} [options]
 * @returns {void}
 */
export function registerPushHandlers(options = {}) {
    // self is the ServiceWorkerGlobalScope. Guard so an accidental import in a
    // non-SW context fails loud but harmless instead of throwing at load time.
    if (typeof self === "undefined" || typeof self.addEventListener !== "function") {
        console.warn("registerPushHandlers() called outside a Service Worker, ignoring");
        return;
    }

    const {
        defaultTitle = "Notification",
        defaultIcon = "/images/pwa-192x192.png",
        defaultBadge = "/images/pwa-64x64.png",
        vibrate = [200, 100, 200],
    } = options;

    // Handle an incoming push message.
    self.addEventListener("push", (event) => {
        if (!event.data) {
            console.warn("Push event received without data, ignoring");
            return;
        }

        let payload;
        try {
            payload = event.data.json();
        } catch (err) {
            // Non-JSON payload: fall back to a plain text body.
            console.warn("Push payload is not valid JSON, using text fallback", err);
            payload = { title: defaultTitle, body: event.data.text() };
        }

        const data = payload.data || {};

        const notificationOptions = {
            body: payload.body || "",
            icon: payload.icon || defaultIcon,
            badge: payload.badge || defaultBadge,
            tag: payload.tag || undefined,
            data,
            vibrate,
            requireInteraction: payload.requireInteraction || false,
            actions: payload.actions || [],
        };

        // A push carrying data.action === "sync" asks the app to refresh its
        // local state. Bridge it to open clients via a "trigger-sync" message
        // and, when a client is already focused/visible, suppress the system
        // notification (the focused app refreshes live, a banner would be
        // redundant). With no focused client the notification is still shown.
        const isSyncPush = data.action === "sync";

        event.waitUntil(
            (async () => {
                if (isSyncPush) {
                    const clientsList = await self.clients.matchAll({
                        type: "window",
                        includeUncontrolled: true,
                    });

                    for (const client of clientsList) {
                        client.postMessage({ type: "trigger-sync", data });
                    }

                    const hasFocusedClient = clientsList.some(
                        (client) =>
                            client.focused === true || client.visibilityState === "visible"
                    );
                    if (hasFocusedClient) {
                        // Silent: the focused app already refreshes via the message.
                        return undefined;
                    }
                }

                return self.registration.showNotification(
                    payload.title || defaultTitle,
                    notificationOptions
                );
            })()
        );
    });

    // Handle a click on a notification: focus an existing window or open one,
    // navigating to the target URL carried in the notification data.
    self.addEventListener("notificationclick", (event) => {
        event.notification.close();

        const data = event.notification.data || {};
        let targetUrl = data.url || "/";

        // Action buttons declared in the payload.
        if (event.action) {
            switch (event.action) {
                case "view":
                    targetUrl = data.url || "/";
                    break;
                case "dismiss":
                    return; // Close only, no navigation.
                default:
                    if (data.actions && data.actions[event.action]) {
                        targetUrl = data.actions[event.action];
                    }
            }
        }

        event.waitUntil(
            self.clients
                .matchAll({ type: "window", includeUncontrolled: true })
                .then((windowClients) => {
                    for (const client of windowClients) {
                        if (client.url.includes(self.location.origin) && "focus" in client) {
                            client.focus();
                            if ("navigate" in client) {
                                client.navigate(targetUrl);
                            }
                            return undefined;
                        }
                    }
                    if (self.clients.openWindow) {
                        return self.clients.openWindow(targetUrl);
                    }
                    return undefined;
                })
        );
    });

    // Handle notification dismissal. No close tracking by default: the reference
    // spec posted to /api.php/push/track, a route that does not exist in the
    // SmartAuth push API. Kept as the documented extension point.
    self.addEventListener("notificationclose", () => {
        // Intentionally empty: no default close tracking.
    });

    // Handle a subscription renewal forced by the browser/push service.
    //
    // A Service Worker has NO access to the app auth token (it lives outside the
    // application context), so it CANNOT re-register the renewed subscription
    // server-side itself. Strategy: re-subscribe locally (no server call) and
    // notify open clients; the app's usePushNotifications hook replays the
    // authenticated POST /push/subscribe with the token in hand. If no client is
    // open, the hook re-checks the subscription at its next mount.
    self.addEventListener("pushsubscriptionchange", (event) => {
        event.waitUntil(
            (async () => {
                try {
                    const subOptions = event.oldSubscription && event.oldSubscription.options;
                    const newSubscription = await self.registration.pushManager.subscribe(subOptions);

                    const all = await self.clients.matchAll({
                        type: "window",
                        includeUncontrolled: true,
                    });
                    for (const client of all) {
                        client.postMessage({
                            type: "push-resubscribe",
                            subscription: newSubscription.toJSON(),
                            oldEndpoint:
                                event.oldSubscription && event.oldSubscription.endpoint
                                    ? event.oldSubscription.endpoint
                                    : null,
                        });
                    }
                } catch (error) {
                    console.error("Failed to renew push subscription", error);
                }
            })()
        );
    });
}
