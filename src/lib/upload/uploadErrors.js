import { createLogger } from "lib/utils";

const log = createLogger("uploadErrors");

// Reading of a failed upload (smartauth POST /upload or the business request
// that attaches the staged file), so the app can tell the user the real
// cause instead of a generic "upload failed".

// Default timeout of useUpload: one photo on a slow mobile uplink takes far
// longer than the 10 s ky default.
export const UPLOAD_TIMEOUT = 120000;

export const toMegabytes = (bytes) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

/**
 * Technical cause of a failed upload, worth showing so a user can report it:
 * the HTTP status when the server (or a proxy, a WAF in front of it)
 * answered, a timeout, or "network" when nothing came back. A refusal by
 * Apache, ModSecurity or a proxy never reaches the server log, only this.
 * A request blocked by the useApi circuit breaker reports the status of the
 * server error that opened it (circuitStatus).
 *
 * @param {Error} error ky HTTPError, TimeoutError, TypeError...
 * @param {number} [timeout] timeout the request ran with, in ms
 * @returns {{kind: "http", status: number}|{kind: "timeout", seconds: number}|{kind: "network", message: string}}
 */
export const uploadFailureDetail = (error, timeout = UPLOAD_TIMEOUT) => {
    const status = error?.response?.status ?? error?.circuitStatus;
    if (status) {
        return { kind: "http", status };
    }
    if (error?.name === "TimeoutError") {
        return { kind: "timeout", seconds: Math.round(timeout / 1000) };
    }
    return { kind: "network", message: String(error?.message || error?.name || "") };
};

/**
 * Size refusal of the upload chain, whatever layer answered: a proxy (413),
 * PHP upload_max_filesize ("File exceeds server limit"), the smartauth limit
 * ("File too large"), or post_max_size, which empties $_FILES so smartauth
 * sees "No file uploaded" although a file was sent.
 *
 * @param {Error} error rejected request
 * @param {object|null} [body] JSON body of the error response (readErrorBody)
 * @returns {boolean}
 */
export const isUploadSizeRefusal = (error, body = null) => {
    if (error?.response?.status === 413) {
        return true;
    }
    const text = `${error?.apiMessage || ""} ${body ? JSON.stringify(body) : ""}`;
    return /file too large|exceeds server limit|no file uploaded/i.test(text);
};

/**
 * JSON body of a rejected request. useApi reads it through a clone in its
 * beforeError hook, so the original body is still unread; a second clone
 * keeps it that way for any later reader.
 *
 * @param {Error} error rejected request
 * @returns {Promise<object|null>} null when there is no JSON body
 */
export const readErrorBody = async (error) => {
    if (!error?.response) {
        return null;
    }
    try {
        return await error.response.clone().json();
    } catch (e) {
        log.warning("error body unreadable", error?.url, e?.message);
        return null;
    }
};
