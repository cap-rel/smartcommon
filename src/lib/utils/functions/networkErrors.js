// Ring buffer of the 20 most recent network errors, for the feedback
// report. Each entry: { method, url (query string stripped), status, at }.
// Query strings are removed because they can carry tokens (Dolibarr
// dolapikey, smartauth tokens in some legacy endpoints).
//
// This module is deliberately NOT wired into window.fetch or any global:
// it is fed only by the ky hooks in useApi/context.jsx, so it observes
// exactly the traffic the library itself makes and nothing else.

const MAX_NETWORK_ERRORS = 20;

const networkErrors = [];
let enabled = true;

export const setNetworkErrorBufferEnabled = (value) => {
    enabled = !!value;
    if (!enabled) {
        networkErrors.length = 0;
    }
};

const stripQueryString = (url) => {
    try {
        const parsed = new URL(url, "http://placeholder.invalid");
        return parsed.origin === "http://placeholder.invalid"
            ? parsed.pathname
            : `${parsed.origin}${parsed.pathname}`;
    } catch (_) {
        // Not a parseable URL: strip everything after '?' manually.
        const q = url.indexOf("?");
        return q === -1 ? url : url.slice(0, q);
    }
};

/**
 * Records a network error. Called from the ky afterResponse and beforeError
 * hooks in useApi/context.jsx.
 *
 * @param {string} method - HTTP method (GET, POST, ...)
 * @param {string} url - Request URL (query string is stripped here)
 * @param {number} status - HTTP status code (0 for network-level failures)
 */
export const recordNetworkError = (method, url, status) => {
    if (!enabled) return;

    networkErrors.push({
        method: String(method ?? "").toUpperCase(),
        url: stripQueryString(String(url ?? "")),
        status: Number(status) || 0,
        at: new Date().toISOString(),
    });

    while (networkErrors.length > MAX_NETWORK_ERRORS) {
        networkErrors.shift();
    }
};

/**
 * Returns the recorded network errors, oldest first.
 *
 * @returns {Array<{method: string, url: string, status: number, at: string}>}
 */
export const getRecentNetworkErrors = () => [...networkErrors];
