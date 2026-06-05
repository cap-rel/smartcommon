/**
 * Debug instrumentation, silent in production unless explicitly enabled.
 * Enable verbose logs by either:
 *   - window.SMARTCOMMON_SYNC_DEBUG = true            (this tab only), or
 *   - localStorage.SMARTCOMMON_SYNC_DEBUG = "1"       (persists across reloads).
 * The threshold alarm below ALWAYS fires (even when verbose is off) so an
 * abnormal sync is caught passively, without knowing which action triggered it.
 */
function syncDebugEnabled() {
    if (typeof window === 'undefined') return false;
    if (window.SMARTCOMMON_SYNC_DEBUG) return true;
    try {
        return window.localStorage
            && window.localStorage.getItem('SMARTCOMMON_SYNC_DEBUG') === '1';
    } catch (e) {
        return false;
    }
}
// Above this many IndexedDB ops in a single phase, log a warning with the call
// stack even when verbose logging is off. Override with
// window.SMARTCOMMON_SYNC_ALARM_OPS = <n>.
function syncAlarmThreshold() {
    if (typeof window !== 'undefined' && Number.isFinite(window.SMARTCOMMON_SYNC_ALARM_OPS)) {
        return window.SMARTCOMMON_SYNC_ALARM_OPS;
    }
    return 1000;
}
function syncLog(...args) {
    if (syncDebugEnabled()) {
        // eslint-disable-next-line no-console
        console.log('[sync]', ...args);
    }
}
// Captures the caller chain so we can see WHAT triggered a sync/pull/push
// (auto-sync online, periodic interval, first full pull, manual call...).
function syncCallStack() {
    try {
        return (new Error().stack || '').split('\n').slice(2, 8).join('\n');
    } catch (e) {
        return '(stack unavailable)';
    }
}
// Fires a console.warn when a phase did an abnormal number of IDB ops, even
// when verbose logging is off. Returns nothing.
function syncAlarm(phase, idbOps, stack, extra) {
    if (idbOps !== null && idbOps >= syncAlarmThreshold()) {
        // eslint-disable-next-line no-console
        console.warn(
            `[sync][ALARM] ${phase} did ${idbOps} IndexedDB ops (~= transactions) ` +
            `>= threshold ${syncAlarmThreshold()}.`,
            extra || '',
            '\nTriggered from:\n' + stack
        );
    }
}
function perfNow() {
    return (typeof performance !== 'undefined' && performance.now)
        ? performance.now()
        : Date.now();
}

/**
 * SyncEngine - Orchestrates synchronization between client and server
 * Handles push, pull, conflict detection, and temp_id mapping
 */
class SyncEngine {
    /**
     * @param {Object} options
     * @param {SyncStorage} options.storage - SyncStorage instance
     * @param {SyncApi} options.api - SyncApi instance
     * @param {string[]} options.scope - Tables to sync
     * @param {number} options.pushChunkSize - Max changes per push request (default: 50)
     */
    constructor({ storage, api, scope, pushChunkSize = 50 }) {
        this.storage = storage;
        this.api = api;
        this.scope = scope;
        this.pushChunkSize = pushChunkSize;
    }

    /**
     * Generate a temporary ID for local creates
     */
    generateTempId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).slice(2, 10);
        return `local_${timestamp}_${random}`;
    }

    /**
     * Check if an ID is a temporary local ID
     */
    isTempId(id) {
        return typeof id === 'string' && id.startsWith('local_');
    }

    // ==================== REGISTRATION ====================

    /**
     * Register this client with the sync server
     * @param {string} deviceUuid - Device UUID from smartAuth JWT
     * @returns {Object} {client_uuid, sync_scope}
     */
    async register(deviceUuid) {
        const result = await this.api.register(deviceUuid, this.scope);

        // Store client UUID and scope in local storage
        await this.storage.setClientUuid(result.client_uuid);
        await this.storage.setSyncScope(result.sync_scope);

        return {
            client_uuid: result.client_uuid,
            sync_scope: result.sync_scope,
            config: result.config
        };
    }

    /**
     * Check if this client is registered
     */
    async isRegistered() {
        const clientUuid = await this.storage.getClientUuid();
        return clientUuid !== null;
    }

    // ==================== FULL SYNC ====================

    /**
     * Perform a complete sync: push local changes, then pull server changes
     * @returns {Object} {pushed, pulled, conflicts, errors}
     */
    async sync() {
        const result = {
            pushed: { success: 0, conflicts: 0, errors: 0 },
            pulled: { updated: 0, deleted: 0 },
            conflicts: [],
            errors: []
        };

        const _t0 = perfNow();
        const _stack = syncCallStack();
        if (this.storage.resetOpStats) this.storage.resetOpStats();
        syncLog('sync start, scope=', this.scope, '\nTriggered from:\n' + _stack);

        // Ensure client UUID is set on API
        const clientUuid = await this.storage.getClientUuid();
        if (clientUuid) {
            this.api.setClientUuid(clientUuid);
        }

        // Step 1: Push local changes
        const pushResult = await this.push();
        result.pushed = pushResult;
        result.conflicts = pushResult.conflicts || [];
        result.errors = pushResult.errors || [];

        // Step 2: Pull server changes
        const pullResult = await this.pull();
        result.pulled = pullResult;

        // Step 3: Clear tombstones after successful sync
        await this.storage.clearTombstones();

        const _ops = this.storage.getOpStats ? this.storage.getOpStats() : null;
        const _total = _ops ? _ops.total : null;
        syncLog(
            `sync done in ${Math.round(perfNow() - _t0)}ms`,
            '| pushed=', result.pushed,
            '| pulled=', result.pulled,
            '| idb ops (~= transactions)=', _ops
        );
        syncAlarm('sync', _total, _stack,
            `(pulled ${result.pulled.updated}/${result.pulled.deleted}, pushed ${result.pushed.success})`);

        return result;
    }

    // ==================== PUSH ====================

    /**
     * Push local pending changes to the server
     * Handles chunking to max 50 changes per request
     * @returns {Object} {success, conflicts, errors, id_mappings}
     */
    async push() {
        const result = {
            success: 0,
            conflicts: [],
            errors: [],
            id_mappings: {}
        };

        const _t0 = perfNow();
        const _stack = syncCallStack();
        const _opsBefore = this.storage.getOpStats ? this.storage.getOpStats().total : null;

        const pendingChanges = await this.storage.getPendingChanges();
        if (pendingChanges.length === 0) {
            return result;
        }

        // Process in chunks
        const chunks = this._chunkArray(pendingChanges, this.pushChunkSize);

        for (const chunk of chunks) {
            const chunkResult = await this._pushChunk(chunk);

            result.success += chunkResult.success;
            result.conflicts.push(...chunkResult.conflicts);
            result.errors.push(...chunkResult.errors);
            Object.assign(result.id_mappings, chunkResult.id_mappings);
        }

        // Apply ID mappings to remaining pending changes and entities
        if (Object.keys(result.id_mappings).length > 0) {
            await this._applyIdMappings(result.id_mappings);
        }

        const opsAfter = this.storage.getOpStats ? this.storage.getOpStats().total : null;
        const idbOps = (opsAfter !== null && _opsBefore !== null) ? opsAfter - _opsBefore : null;
        syncLog(
            `push done in ${Math.round(perfNow() - _t0)}ms`,
            `| pending=${pendingChanges.length} chunks=${chunks.length}`,
            `| success=${result.success} conflicts=${result.conflicts.length} errors=${result.errors.length}`,
            `| id_mappings=${Object.keys(result.id_mappings).length}`,
            `| idb ops (~= transactions)=${idbOps}`
        );
        syncAlarm('push', idbOps, _stack,
            `(pending=${pendingChanges.length}, chunks=${chunks.length}, success=${result.success})`);

        return result;
    }

    /**
     * Push a single chunk of changes
     */
    async _pushChunk(changes) {
        const result = {
            success: 0,
            conflicts: [],
            errors: [],
            id_mappings: {}
        };

        // Format changes for API
        const apiChanges = changes.map(change => ({
            table: change.table,
            action: change.action,
            id: change.id,
            temp_id: change.temp_id,
            base_tms: change.base_tms,
            data: change.data,
            local_updated_at: change.created_at
        }));

        try {
            const response = await this.api.push(apiChanges);

            // Process successful changes
            if (response.results.success) {
                for (const success of response.results.success) {
                    result.success++;

                    // Find the original pending change
                    const original = changes.find(c =>
                        (c.temp_id && c.temp_id === success.temp_id) ||
                        (c.id && c.id === success.id)
                    );

                    if (original) {
                        // Remove from pending changes
                        await this.storage.deletePendingChange(original.queue_id);

                        // Update entity with server tms
                        if (success.server_id) {
                            // For creates: update the entity with the real server ID
                            const entity = await this.storage.getEntity(original.table, original.temp_id || original.id);
                            if (entity) {
                                await this.storage.deleteEntity(original.table, original.temp_id || original.id);
                                await this.storage.putEntity(
                                    original.table,
                                    success.server_id,
                                    entity.data,
                                    success.tms,
                                    null // Clear local_updated_at
                                );
                            }
                            result.id_mappings[original.temp_id] = success.server_id;
                        } else if (success.tms) {
                            // For updates: just update the tms
                            const entity = await this.storage.getEntity(original.table, original.id);
                            if (entity) {
                                await this.storage.putEntity(
                                    original.table,
                                    original.id,
                                    entity.data,
                                    success.tms,
                                    null
                                );
                            }
                        }
                    }
                }
            }

            // Store ID mappings from response
            if (response.results.id_mappings) {
                Object.assign(result.id_mappings, response.results.id_mappings);
            }

            // Process conflicts
            if (response.results.conflicts) {
                for (const conflict of response.results.conflicts) {
                    // Store conflict locally for resolution
                    await this.storage.addConflict({
                        conflict_id: conflict.conflict_id,
                        table: conflict.table,
                        object_id: conflict.id,
                        client_data: conflict.client_data,
                        server_data: conflict.server_data,
                        client_tms: conflict.client_tms,
                        server_tms: conflict.server_tms,
                        field_conflicts: conflict.field_conflicts,
                        created_at: new Date().toISOString()
                    });

                    // Remove from pending changes (conflict is now tracked separately)
                    const original = changes.find(c => c.id === conflict.id && c.table === conflict.table);
                    if (original) {
                        await this.storage.deletePendingChange(original.queue_id);
                    }

                    result.conflicts.push(conflict);
                }
            }

            // Process errors
            if (response.results.errors) {
                for (const error of response.results.errors) {
                    // Remove from pending changes if object not found (already deleted)
                    if (error.error === 'OBJECT_NOT_FOUND') {
                        const original = changes.find(c => c.id === error.id && c.table === error.table);
                        if (original) {
                            await this.storage.deletePendingChange(original.queue_id);
                            await this.storage.deleteEntity(error.table, error.id);
                        }
                    }
                    result.errors.push(error);
                }
            }

        } catch (error) {
            // Network or server error - keep changes pending for retry
            result.errors.push({
                error: 'PUSH_FAILED',
                message: error.message
            });
        }

        return result;
    }

    /**
     * Apply ID mappings to entities that reference temp_ids
     */
    async _applyIdMappings(idMappings) {
        // Get all entities and update FK references
        for (const table of this.scope) {
            const entities = await this.storage.getEntitiesByTable(table);

            for (const entity of entities) {
                let updated = false;
                const newData = { ...entity.data };

                // Check each field for temp_id references
                for (const [field, value] of Object.entries(newData)) {
                    if (this.isTempId(value) && idMappings[value]) {
                        newData[field] = idMappings[value];
                        updated = true;
                    }
                }

                if (updated) {
                    await this.storage.putEntity(
                        entity.table,
                        entity.id,
                        newData,
                        entity.server_tms,
                        entity.local_updated_at
                    );
                }
            }
        }

        // Also update pending changes that reference temp_ids
        const pendingChanges = await this.storage.getPendingChanges();
        for (const change of pendingChanges) {
            if (change.data) {
                let updated = false;
                const newData = { ...change.data };

                for (const [field, value] of Object.entries(newData)) {
                    if (this.isTempId(value) && idMappings[value]) {
                        newData[field] = idMappings[value];
                        updated = true;
                    }
                }

                if (updated) {
                    await this.storage.deletePendingChange(change.queue_id);
                    await this.storage.addPendingChange({
                        ...change,
                        data: newData,
                        queue_id: undefined // Let it auto-generate
                    });
                }
            }
        }
    }

    // ==================== PULL ====================

    /**
     * Pull changes from server
     * @returns {Object} {updated, deleted}
     */
    async pull() {
        const result = { updated: 0, deleted: 0 };

        const _t0 = perfNow();
        const _stack = syncCallStack();
        const _opsBefore = this.storage.getOpStats ? this.storage.getOpStats().total : null;
        const _perTable = {};
        let _pages = 0;

        const lastSyncTime = await this.storage.getLastSyncTime();
        let hasMore = true;
        let offset = 0;

        while (hasMore) {
            const response = await this.api.pull(this.scope, lastSyncTime, 500, offset);
            _pages++;
            hasMore = false;

            for (const [table, changes] of Object.entries(response.changes)) {
                // Process updated entities
                if (changes.updated) {
                    for (const entity of changes.updated) {
                        // Check if we have a local modification that would be overwritten
                        const existing = await this.storage.getEntity(table, entity.id);

                        if (existing && existing.local_updated_at) {
                            // Local modification exists - don't overwrite, will be handled on push
                            continue;
                        }

                        await this.storage.putEntity(
                            table,
                            entity.id,
                            entity,
                            entity.tms,
                            null
                        );
                        result.updated++;
                        (_perTable[table] = _perTable[table] || { updated: 0, deleted: 0 }).updated++;
                    }
                }

                // Process deleted entities
                if (changes.deleted) {
                    for (const tombstone of changes.deleted) {
                        // Check if we have local modifications
                        const existing = await this.storage.getEntity(table, tombstone.id);

                        if (existing && existing.local_updated_at) {
                            // Will create a DELETE-UPDATE conflict on push
                            continue;
                        }

                        await this.storage.deleteEntity(table, tombstone.id);
                        result.deleted++;
                        (_perTable[table] = _perTable[table] || { updated: 0, deleted: 0 }).deleted++;
                    }
                }

                // Check if there's more data for this table
                if (changes.has_more) {
                    hasMore = true;
                }
            }

            if (hasMore) {
                offset += 500;
            }

            // Update last sync time from server response
            if (response.server_time) {
                await this.storage.setLastSyncTime(response.server_time);
            }
        }

        const opsAfter = this.storage.getOpStats ? this.storage.getOpStats().total : null;
        const idbOps = (opsAfter !== null && _opsBefore !== null) ? opsAfter - _opsBefore : null;
        syncLog(
            `pull done in ${Math.round(perfNow() - _t0)}ms`,
            `| pages=${_pages}`,
            `| updated=${result.updated} deleted=${result.deleted}`,
            '| per-table=', _perTable,
            `| idb ops (~= transactions)=${idbOps}`
        );
        syncAlarm('pull', idbOps, _stack,
            `(pages=${_pages}, updated=${result.updated}, deleted=${result.deleted}, per-table=${JSON.stringify(_perTable)})`);

        return result;
    }

    // ==================== LOCAL OPERATIONS ====================

    /**
     * Create a new entity locally (offline-capable)
     * @param {string} table - Table name
     * @param {Object} data - Entity data
     * @returns {string} Temporary ID
     */
    async createLocal(table, data) {
        const tempId = this.generateTempId();

        // Store entity with temp_id
        await this.storage.putEntity(
            table,
            tempId,
            { ...data, id: tempId },
            null, // No server_tms yet
            new Date().toISOString()
        );

        // Queue the change
        await this.storage.addPendingChange({
            table,
            action: 'create',
            temp_id: tempId,
            data,
            base_tms: null
        });

        return tempId;
    }

    /**
     * Update an entity locally (offline-capable)
     * @param {string} table - Table name
     * @param {number|string} id - Entity ID
     * @param {Object} data - Updated fields
     */
    async updateLocal(table, id, data) {
        const existing = await this.storage.getEntity(table, id);
        if (!existing) {
            throw new Error(`Entity not found: ${table}/${id}`);
        }

        const updatedData = { ...existing.data, ...data };
        const now = new Date().toISOString();

        // Update the entity
        await this.storage.putEntity(
            table,
            id,
            updatedData,
            existing.server_tms,
            now
        );

        // Queue the change
        await this.storage.addPendingChange({
            table,
            action: 'update',
            id,
            base_tms: existing.server_tms,
            data
        });
    }

    /**
     * Upsert an entity locally (create if not exists, update if exists)
     * This is useful for caching data without syncing to server
     * @param {string} table - Table name
     * @param {number|string} id - Entity ID
     * @param {Object} data - Entity data
     * @param {boolean} queueChange - Whether to queue change for sync (default: false for cache-only)
     */
    async upsertLocal(table, id, data, queueChange = false) {
        const existing = await this.storage.getEntity(table, id);
        const now = new Date().toISOString();

        if (existing) {
            // Update existing entity
            const updatedData = { ...existing.data, ...data };
            await this.storage.putEntity(
                table,
                id,
                updatedData,
                existing.server_tms,
                now
            );

            if (queueChange) {
                await this.storage.addPendingChange({
                    table,
                    action: 'update',
                    id,
                    base_tms: existing.server_tms,
                    data
                });
            }
        } else {
            // Create new entity (cache-only, no temp_id)
            await this.storage.putEntity(
                table,
                id,
                { ...data, id },
                null,
                now
            );

            if (queueChange) {
                await this.storage.addPendingChange({
                    table,
                    action: 'create',
                    temp_id: id,
                    data,
                    base_tms: null
                });
            }
        }
    }

    /**
     * Delete an entity locally (offline-capable)
     * @param {string} table - Table name
     * @param {number|string} id - Entity ID
     */
    async deleteLocal(table, id) {
        const existing = await this.storage.getEntity(table, id);
        if (!existing) {
            throw new Error(`Entity not found: ${table}/${id}`);
        }

        // Add tombstone
        await this.storage.addTombstone(table, id);

        // Remove entity
        await this.storage.deleteEntity(table, id);

        // Queue the change (only if it's not a temp entity that was never synced)
        if (!this.isTempId(id)) {
            await this.storage.addPendingChange({
                table,
                action: 'delete',
                id,
                base_tms: existing.server_tms,
                data: null
            });
        } else {
            // For temp entities, just remove the pending create
            const pendingChanges = await this.storage.getPendingChanges();
            const createChange = pendingChanges.find(
                c => c.temp_id === id && c.action === 'create'
            );
            if (createChange) {
                await this.storage.deletePendingChange(createChange.queue_id);
            }
        }
    }

    // ==================== CONFLICTS ====================

    /**
     * Get all pending conflicts
     */
    async getConflicts() {
        // Get both local and server conflicts
        const localConflicts = await this.storage.getConflicts();

        try {
            const serverResponse = await this.api.getConflicts();
            // Merge, preferring server data for conflicts with same ID
            const serverConflictIds = new Set(serverResponse.conflicts.map(c => c.conflict_id));
            const uniqueLocalConflicts = localConflicts.filter(
                c => !serverConflictIds.has(c.conflict_id)
            );

            return [...serverResponse.conflicts, ...uniqueLocalConflicts];
        } catch (error) {
            // Offline - return local conflicts only
            return localConflicts;
        }
    }

    /**
     * Resolve a conflict
     * @param {number} conflictId - Conflict ID
     * @param {string} resolution - 'client', 'server', or 'merged'
     * @param {Object|null} data - Merged data (required for 'merged')
     */
    async resolveConflict(conflictId, resolution, data = null) {
        // Get conflict details
        const conflict = await this.storage.getConflict(conflictId);
        if (!conflict) {
            throw new Error(`Conflict not found: ${conflictId}`);
        }

        // Send resolution to server
        const result = await this.api.resolveConflict(conflictId, resolution, data);

        // Update local entity with resolved data
        const finalData = resolution === 'client'
            ? conflict.client_data
            : resolution === 'server'
                ? conflict.server_data
                : data;

        await this.storage.putEntity(
            conflict.table,
            conflict.object_id,
            finalData,
            result.object.tms,
            null // Clear local_updated_at
        );

        // Remove conflict from local storage
        await this.storage.deleteConflict(conflictId);

        return result;
    }

    // ==================== UTILITIES ====================

    /**
     * Split an array into chunks
     */
    _chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Get sync status
     */
    async getStatus() {
        const [clientUuid, lastSyncTime, pendingCount, conflictsCount, stats] = await Promise.all([
            this.storage.getClientUuid(),
            this.storage.getLastSyncTime(),
            this.storage.getPendingChangesCount(),
            this.storage.getConflictsCount(),
            this.storage.getStats()
        ]);

        return {
            isRegistered: clientUuid !== null,
            clientUuid,
            lastSyncTime,
            pendingCount,
            conflictsCount,
            stats
        };
    }

    /**
     * Reset all sync data (useful for logout)
     */
    async reset() {
        await this.storage.clear();
    }
}

export { SyncEngine };
export default SyncEngine;
