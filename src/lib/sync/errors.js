/**
 * Errors shared by the sync hooks and engine (framework-agnostic).
 */

/**
 * Checks if an error is a 403 Forbidden error.
 * Sync stops immediately on 403 to avoid firewall blacklisting.
 */
export const isForbiddenError = (err) => {
    if (err?.response?.status === 403) return true;
    if (err?.status === 403) return true;
    if (err?.message?.includes("403")) return true;
    return false;
};

/**
 * Custom error class for 403 errors to stop sync loops immediately
 */
export class ForbiddenSyncError extends Error {
    constructor(message = "Access forbidden (403) - sync stopped to prevent firewall blacklisting") {
        super(message);
        this.name = "ForbiddenSyncError";
        this.isForbidden = true;
    }
}
