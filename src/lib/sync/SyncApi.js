/**
 * SyncApi - HTTP client for the SmartAuth sync endpoints (SyncController).
 *
 * Requests go through the ky instance of useApi().private, which already adds
 * the access token and X-DeviceId, refreshes an expired token and applies the
 * circuit breaker. This class only shapes the payloads of the sync contract:
 * the client is identified by `client_uuid` in the query string (GET) or the
 * JSON body (POST), and pull/push handle ONE object type per call.
 */

/**
 * Turns a ky HTTPError (or a network error) into an Error carrying
 * `status` (0 for network errors), `code` and the parsed body in `data`.
 */
const toSyncError = async (error, endpoint) => {
    const response = error?.response;
    if (!response) {
        const networkError = new Error(`${endpoint}: ${error?.message || 'network error'}`);
        networkError.status = 0;
        networkError.cause = error;
        return networkError;
    }

    let data = null;
    try {
        data = await response.clone().json();
    } catch {
        data = null;
    }

    const message = data?.error || data?.message || error.apiMessage || `HTTP ${response.status}`;
    const syncError = new Error(`${endpoint}: ${message}`);
    syncError.status = response.status;
    syncError.code = error.apiCode || data?.code || null;
    syncError.data = data;
    syncError.cause = error;
    return syncError;
};

/** Drops null/undefined entries: ky would send them as the string "undefined". */
const compactParams = (params) => Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

class SyncApi {
    /**
     * @param {Object} options
     * @param {Function} options.getHttp - Returns the ky instance to use
     *   (useApi().private). Read on every request: useApi hands out a new
     *   instance on each render.
     */
    constructor({ getHttp }) {
        if (typeof getHttp !== 'function') {
            throw new Error('SyncApi: getHttp must be a function returning the useApi().private instance');
        }
        this.getHttp = getHttp;
        this.clientUuid = null;
    }

    setClientUuid(uuid) {
        this.clientUuid = uuid;
    }

    _http(endpoint) {
        const http = this.getHttp();
        if (!http) {
            const error = new Error(`${endpoint}: API client not available`);
            error.status = 0;
            throw error;
        }
        return http;
    }

    _requireClientUuid(endpoint) {
        if (!this.clientUuid) {
            throw new Error(`${endpoint}: client_uuid not set, register the sync client first`);
        }
    }

    async _get(endpoint, searchParams = {}) {
        const http = this._http(endpoint);
        try {
            return await http.get(endpoint, { searchParams: compactParams(searchParams) }).json();
        } catch (error) {
            throw await toSyncError(error, endpoint);
        }
    }

    async _post(endpoint, json = {}) {
        const http = this._http(endpoint);
        try {
            return await http.post(endpoint, { json }).json();
        } catch (error) {
            throw await toSyncError(error, endpoint);
        }
    }

    // ==================== SYNC ENDPOINTS ====================

    /**
     * GET sync/objects - syncable object types and the caller's rights.
     * @returns {Promise<{objects: Object[], server_time: string}>}
     */
    async getObjects() {
        return await this._get('sync/objects');
    }

    /**
     * POST sync/register (idempotent for a given client_uuid).
     * Requires a device-bound token: the server reads the device from the JWT.
     *
     * @param {string} clientUuid - UUID generated and stored by the client
     * @param {string[]} scope - Object types to sync
     * @param {string} [appVersion]
     * @returns {Promise<{client_id: number, client_uuid: string, server_time: string, sync_scope: Object}>}
     */
    async register(clientUuid, scope, appVersion) {
        const data = await this._post('sync/register', {
            client_uuid: clientUuid,
            sync_scope: scope,
            ...(appVersion ? { app_version: appVersion } : {})
        });
        this.setClientUuid(clientUuid);
        return data;
    }

    /**
     * GET sync/pull for one object type.
     *
     * @param {string} objectType
     * @param {Object} [options]
     * @param {string|null} [options.lastSyncAt] - Keep it FIXED across pages
     * @param {number} [options.limit] - 1..1000
     * @param {string|null} [options.cursor] - next_cursor of the previous page
     * @returns {Promise<{updated: Object[], deleted: Object[], has_more: boolean, next_cursor?: string, server_time: string}>}
     */
    async pull(objectType, { lastSyncAt = null, limit = 500, cursor = null } = {}) {
        this._requireClientUuid('sync/pull');
        return await this._get('sync/pull', {
            client_uuid: this.clientUuid,
            object_type: objectType,
            last_sync_at: lastSyncAt,
            limit,
            cursor
        });
    }

    /**
     * POST sync/push for one object type.
     *
     * @param {string} objectType
     * @param {Object[]} changes - {action, id, temp_id?, base_tms, data}
     * @returns {Promise<{success: number[], conflicts: Object[], errors: Object[], id_mapping: Object, server_time: string}>}
     */
    async push(objectType, changes) {
        this._requireClientUuid('sync/push');
        return await this._post('sync/push', {
            client_uuid: this.clientUuid,
            object_type: objectType,
            changes
        });
    }

    /**
     * GET sync/conflicts - pending conflicts of this client.
     * @returns {Promise<{conflicts: Object[], server_time: string}>}
     */
    async getConflicts() {
        this._requireClientUuid('sync/conflicts');
        return await this._get('sync/conflicts', { client_uuid: this.clientUuid });
    }

    /**
     * POST sync/conflicts/{id}/resolve
     *
     * @param {number} conflictId - Server conflict id
     * @param {'client'|'server'|'merged'} resolution
     * @param {Object|null} data - Required for 'merged'
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async resolveConflict(conflictId, resolution, data = null) {
        const body = { resolution };
        if (data !== null) {
            body.data = data;
        }
        return await this._post(`sync/conflicts/${encodeURIComponent(conflictId)}/resolve`, body);
    }

    /**
     * GET sync/status - server-side state of this client.
     * @returns {Promise<{client_uuid: string, last_sync_at: string|null, pending_conflicts: number, server_time: string, sync_scope: Object}>}
     */
    async getStatus() {
        this._requireClientUuid('sync/status');
        return await this._get('sync/status', { client_uuid: this.clientUuid });
    }
}

export { SyncApi };
export default SyncApi;
