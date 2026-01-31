/**
 * SyncApi - HTTP client for sync endpoints
 * Handles authentication, retry with exponential backoff, and error handling
 */
class SyncApi {
    /**
     * @param {Object} options
     * @param {string} options.baseUrl - Base URL for the API (e.g., '/api/smartauth')
     * @param {Function} options.getAccessToken - Function that returns the JWT access token
     * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
     * @param {number} options.baseDelay - Base delay in ms for exponential backoff (default: 1000)
     * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
     */
    constructor({
        baseUrl,
        getAccessToken,
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 30000
    }) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.getAccessToken = getAccessToken;
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
        this.clientUuid = null;
    }

    /**
     * Set the client UUID for X-Sync-Client-UUID header
     */
    setClientUuid(uuid) {
        this.clientUuid = uuid;
    }

    /**
     * Build headers for API requests
     */
    async _buildHeaders() {
        const token = await this.getAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (this.clientUuid) {
            headers['X-Sync-Client-UUID'] = this.clientUuid;
        }

        return headers;
    }

    /**
     * Calculate delay for exponential backoff
     */
    _calculateDelay(attempt) {
        const delay = this.baseDelay * Math.pow(2, attempt);
        return Math.min(delay, this.maxDelay);
    }

    /**
     * Sleep for a given duration
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if error is retryable
     */
    _isRetryable(status) {
        // Retry on network errors (status 0) and server errors (5xx)
        return status === 0 || (status >= 500 && status < 600);
    }

    /**
     * Execute a fetch request with retry logic
     */
    async _fetchWithRetry(url, options) {
        let lastError = null;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);

                // Don't retry on success or client errors (except network issues)
                if (response.ok || !this._isRetryable(response.status)) {
                    return response;
                }

                // Server error - will retry if attempts remaining
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                lastError.status = response.status;

            } catch (error) {
                // Network error
                lastError = error;
                lastError.status = 0;
            }

            // If we have retries left, wait before next attempt
            if (attempt < this.maxRetries) {
                const delay = this._calculateDelay(attempt);
                await this._sleep(delay);
            }
        }

        // All retries exhausted
        throw lastError;
    }

    /**
     * Parse response and handle errors
     */
    async _parseResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || data.error || `HTTP ${response.status}`);
            error.status = response.status;
            error.code = data.code || null;
            error.data = data;
            throw error;
        }

        return data;
    }

    /**
     * Execute a GET request
     */
    async _get(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        const headers = await this._buildHeaders();
        const response = await this._fetchWithRetry(url.toString(), {
            method: 'GET',
            headers
        });

        return this._parseResponse(response);
    }

    /**
     * Execute a POST request
     */
    async _post(endpoint, body = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = await this._buildHeaders();

        const response = await this._fetchWithRetry(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        return this._parseResponse(response);
    }

    // ==================== SYNC ENDPOINTS ====================

    /**
     * Register a new sync client
     * POST /sync/register
     *
     * @param {string} deviceUuid - Device UUID from smartAuth
     * @param {string[]} scope - Requested sync scope (table names)
     * @returns {Object} {client_uuid, sync_scope, server_time, config}
     */
    async register(deviceUuid, scope) {
        const data = await this._post('/sync/register', {
            device_uuid: deviceUuid,
            platform: 'PWA',
            user_agent: navigator.userAgent,
            requested_scope: scope
        });

        // Store the client UUID for future requests
        if (data.client_uuid) {
            this.setClientUuid(data.client_uuid);
        }

        return data;
    }

    /**
     * Pull changes from server
     * GET /sync/pull
     *
     * @param {string|string[]} tables - Table names or '*' for all
     * @param {string|null} since - ISO8601 timestamp of last sync
     * @param {number} limit - Max objects per table (default: 500)
     * @param {number} offset - Pagination offset
     * @returns {Object} {server_time, changes: {table: {updated, deleted, has_more}}, stats}
     */
    async pull(tables, since = null, limit = 500, offset = 0) {
        const tablesParam = Array.isArray(tables) ? tables.join(',') : tables;

        return await this._get('/sync/pull', {
            tables: tablesParam,
            since,
            limit,
            offset
        });
    }

    /**
     * Push changes to server
     * POST /sync/push
     *
     * @param {Object[]} changes - Array of changes
     * @param {string} changes[].table - Table name
     * @param {string} changes[].action - 'create', 'update', or 'delete'
     * @param {number|string} changes[].id - Object ID (or temp_id for create)
     * @param {string} changes[].base_tms - Base timestamp for conflict detection
     * @param {Object} changes[].data - Object data
     * @returns {Object} {server_time, results: {success, conflicts, errors, id_mappings}, stats}
     */
    async push(changes) {
        return await this._post('/sync/push', { changes });
    }

    /**
     * Get pending conflicts
     * GET /sync/conflicts
     *
     * @returns {Object} {conflicts: [...], total}
     */
    async getConflicts() {
        return await this._get('/sync/conflicts');
    }

    /**
     * Resolve a conflict
     * POST /sync/conflicts/{id}/resolve
     *
     * @param {number} conflictId - Conflict ID
     * @param {string} resolution - 'client', 'server', or 'merged'
     * @param {Object|null} data - Merged data (required if resolution is 'merged')
     * @returns {Object} {status, object}
     */
    async resolveConflict(conflictId, resolution, data = null) {
        const body = { resolution };
        if (data !== null) {
            body.data = data;
        }

        return await this._post(`/sync/conflicts/${conflictId}/resolve`, body);
    }

    /**
     * Get sync status
     * GET /sync/status
     *
     * @returns {Object} {client_uuid, last_sync_at, pending_conflicts, sync_scope, server_stats}
     */
    async getStatus() {
        return await this._get('/sync/status');
    }

    /**
     * Unregister the sync client
     * DELETE /sync/client
     *
     * @returns {Object} {status}
     */
    async unregister() {
        const url = `${this.baseUrl}/sync/client`;
        const headers = await this._buildHeaders();

        const response = await this._fetchWithRetry(url, {
            method: 'DELETE',
            headers
        });

        return this._parseResponse(response);
    }
}

export { SyncApi };
export default SyncApi;
