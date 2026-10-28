import { getRecentLogs, getRecentNetworkErrors, navigatorInfo } from "lib/utils";
import { convertImageForUpload } from "lib/upload";

// Screenshot limits from the capTests spec (section 8.2):
// max 5120 KB on the wire, resized to 1920 px wide at most, targeting
// 2 MB so the multipart upload stays fast on a mobile uplink.
export const SCREENSHOT_MAX_SIDE = 1920;
export const SCREENSHOT_MAX_BYTES = 5120 * 1024;
export const SCREENSHOT_TARGET_BYTES = 2 * 1024 * 1024;
export const SCREENSHOT_ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp"];

// Reduce a screenshot File before it leaves the device. Always resolves
// (never rejects): on decode/encode failure the original file is kept,
// the server-side limit is the final guard.
export const prepareScreenshot = async (file) => {
    try {
        const result = await convertImageForUpload(file, {
            maxSide: SCREENSHOT_MAX_SIDE,
            maxBytes: SCREENSHOT_MAX_BYTES,
            targetBytes: SCREENSHOT_TARGET_BYTES,
            acceptedMimes: SCREENSHOT_ACCEPTED_MIMES,
        });
        return result.file;
    } catch (_) {
        return file;
    }
};

// Strip the query string from a URL: it can carry tokens.
export const stripQuery = (url) => {
    const q = url.indexOf("?");
    return q === -1 ? url : url.slice(0, q);
};

// Build the context object sent with every report. Identity fields
// (reporter, rights, installed_version) and channel are NEVER set here:
// the relay fills them from the smartauth token and its own config.
export const buildContext = (appVersion, locationHref) => {
    const pageUrl = typeof locationHref === "string"
        ? stripQuery(locationHref)
        : (typeof window !== "undefined" ? stripQuery(window.location.href) : "");

    return {
        app_version: appVersion || undefined,
        page_url: pageUrl || undefined,
        route: pageUrl ? new URL(pageUrl).pathname : undefined,
        viewport: typeof window !== "undefined"
            ? `${window.innerWidth}x${window.innerHeight}`
            : undefined,
        locale: navigatorInfo.language || undefined,
        occurred_at: new Date().toISOString(),
        log_excerpt: getRecentLogs(),
        network_errors: getRecentNetworkErrors(),
    };
};

// Build the multipart form. The screenshot is appended as a File when
// present; consent is "1" or "0".
//
// The context fields are sent FLAT, with the exact names the PHP relay
// reads (Relay.php buildPayload: stringField('page_url') and friends,
// the widget of the Dolibarr pages sends the same): page_url, route,
// app_version, viewport, locale, occurred_at, repeated log_excerpt[]
// parts, and network_errors[i][method|url|status|at]. channel is never
// sent: the relay sets it from its own configuration.
//
// `context` may be passed precomputed: a report queued while offline keeps
// the context captured at SUBMIT time, so the flush describes the moment
// of the problem, not the moment the network came back.
export const buildFormData = ({ type, title, body, screenshot, consent, appVersion, locationHref, context: providedContext }) => {
    const formData = new FormData();
    const context = providedContext ?? buildContext(appVersion, locationHref);

    formData.append("type", type);
    if (title) formData.append("title", title);
    formData.append("body", body);

    if (context.app_version) formData.append("app_version", context.app_version);
    if (context.page_url) formData.append("page_url", context.page_url);
    if (context.route) formData.append("route", context.route);
    if (context.viewport) formData.append("viewport", context.viewport);
    if (context.locale) formData.append("locale", context.locale);
    formData.append("occurred_at", context.occurred_at);

    (context.log_excerpt ?? []).forEach((line) => {
        formData.append("log_excerpt[]", line);
    });
    (context.network_errors ?? []).forEach((err, i) => {
        formData.append(`network_errors[${i}][method]`, err.method);
        formData.append(`network_errors[${i}][url]`, err.url);
        formData.append(`network_errors[${i}][status]`, String(err.status));
        formData.append(`network_errors[${i}][at]`, err.at);
    });

    if (screenshot) {
        formData.append("screenshot", screenshot, screenshot.name || "screenshot.jpg");
        formData.append("screenshot_consent", consent ? "1" : "0");
    }

    return formData;
};

// Relay statuses worth a deferred retry: the refusal is transient (rate
// limit, upstream outage), so the report is queued and resent later with
// the same idempotency key. Any other HTTP error is a definitive refusal
// of THIS content: queueing it would resend it forever.
export const RETRYABLE_RELAY_STATUS = [429, 502, 503];

// Statuses that keep an ALREADY QUEUED report in the offline queue when
// a flush fails. 429/502/503 are transient, but so are 401 and 408: an
// expired session at network return (or the app reopened on the login
// screen) says nothing about the content - the report would pass after
// a reconnection, so dropping the row would lose it. Any other HTTP
// status is a definitive refusal of THIS content: the row is dropped
// instead of being resent forever.
export const FLUSH_KEEP_STATUS = [401, 408, 429, 502, 503];

// List of keys that must NEVER appear in the payload. The relay fills
// the identity fields from the smartauth token server-side, and channel
// from its own configuration: the browser sends neither.
export const IDENTITY_KEYS = [
    "reporter",
    "reporter[email]",
    "reporter[name]",
    "reporter[external_ref]",
    "reporter[is_referent]",
    "installed_version",
    "channel",
];
