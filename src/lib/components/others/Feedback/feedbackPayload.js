import { getRecentLogs, getRecentNetworkErrors, navigatorInfo } from "lib/utils";

// Strip the query string from a URL: it can carry tokens.
export const stripQuery = (url) => {
    const q = url.indexOf("?");
    return q === -1 ? url : url.slice(0, q);
};

// Build the context block sent with every report. Identity fields
// (reporter, rights, installed_version) are NEVER set here: the relay
// fills them from the smartauth token server-side.
export const buildContext = (appVersion, locationHref) => {
    const pageUrl = typeof locationHref === "string"
        ? stripQuery(locationHref)
        : (typeof window !== "undefined" ? stripQuery(window.location.href) : "");

    return {
        channel: "pwa",
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
// present; consent is "1" or "0". The context object is flattened into
// bracket-notation fields so the PHP relay can validate them with
// Laravel's native dot-notation rules.
export const buildFormData = ({ type, title, body, screenshot, consent, appVersion, locationHref }) => {
    const formData = new FormData();
    const context = buildContext(appVersion, locationHref);

    formData.append("type", type);
    if (title) formData.append("title", title);
    formData.append("body", body);

    formData.append("context[channel]", context.channel);
    if (context.app_version) formData.append("context[app_version]", context.app_version);
    if (context.page_url) formData.append("context[page_url]", context.page_url);
    if (context.route) formData.append("context[route]", context.route);
    if (context.viewport) formData.append("context[viewport]", context.viewport);
    if (context.locale) formData.append("context[locale]", context.locale);
    formData.append("context[occurred_at]", context.occurred_at);

    (context.log_excerpt ?? []).forEach((line, i) => {
        formData.append(`context[log_excerpt][${i}]`, line);
    });
    (context.network_errors ?? []).forEach((err, i) => {
        formData.append(`context[network_errors][${i}][method]`, err.method);
        formData.append(`context[network_errors][${i}][url]`, err.url);
        formData.append(`context[network_errors][${i}][status]`, String(err.status));
        formData.append(`context[network_errors][${i}][at]`, err.at);
    });

    if (screenshot) {
        formData.append("screenshot", screenshot, screenshot.name || "screenshot.jpg");
        formData.append("screenshot_consent", consent ? "1" : "0");
    }

    return formData;
};

// List of identity-related keys that must NEVER appear in the payload.
// The relay fills them from the smartauth token server-side.
export const IDENTITY_KEYS = [
    "reporter",
    "reporter[email]",
    "reporter[name]",
    "reporter[external_ref]",
    "reporter[is_referent]",
    "installed_version",
    "context[rights]",
];
