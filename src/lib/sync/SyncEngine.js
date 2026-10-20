import { createLogger } from "lib/utils";
import { isForbiddenError, ForbiddenSyncError } from "./errors";

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

const logger = createLogger("SyncEngine");

// Push order across object types: parents are created first and deleted last,
// assuming the consumer lists them first in `scope`.
const ACTION_ORDER = ['create', 'update', 'delete'];

// Error string of SyncController for an object missing (or hidden) server-side.
const OBJECT_NOT_FOUND = 'Object not found';

// Sent instead of "no last_sync_at" for a full pull: without the parameter the
// server falls back to the client's stored last_sync_at, which every successful
// push advances, so a first pull after a push would silently miss rows.
const FULL_PULL_SINCE = '1970-01-01T00:00:00+00:00';

const LOCAL_CONFLICT_PREFIX = 'local:';

const watermarkKey = (table) => `last_sync_at:${table}`;

/** Same shape as the server's date('c'), the format it hands back in server_time. */
const toServerTimestamp = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, '+00:00');

const isLocalConflictId = (id) => typeof id === 'string' && id.startsWith(LOCAL_CONFLICT_PREFIX);

/**
 * The server describes field conflicts as an object keyed by field name;
 * ConflictResolver expects the list of conflicting field names.
 */
const conflictFieldNames = (fieldConflicts) => {
    if (Array.isArray(fieldConflicts)) return fieldConflicts;
    if (fieldConflicts && typeof fieldConflicts === 'object') return Object.keys(fieldConflicts);
    return [];
};

const isClientNotRegistered = (error) => error?.status === 404
    && /not registered/i.test(String(error?.data?.error || error?.message || ''));

const generateUuid = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // RFC 4122 v4 from getRandomValues: the server only accepts a valid UUID.
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/**
 * SyncEngine - Orchestrates synchronization between client and server
 * Handles push, pull, conflict detection, and temp_id mapping
 *
 * Contract: SmartAuth SyncController. Local "tables" are the server object
 * types (thirdparty, contact, product...): the same names go in `scope`.
 */
class SyncEngine {
    /**
     * @param {Object} options
     * @param {SyncStorage} options.storage - SyncStorage instance
     * @param {SyncApi} options.api - SyncApi instance
     * @param {string[]} options.scope - Object types to sync, parents first
     * @param {number} options.pushChunkSize - Max changes per push request (default: 50)
     * @param {number} options.pullPageSize - Rows per pull page, 1..1000 (default: 500)
     * @param {string|null} options.appVersion - Sent to sync/register
     */
    constructor({ storage, api, scope, pushChunkSize = 50, pullPageSize = 500, appVersion = null }) {
        this.storage = storage;
        this.api = api;
        this.scope = scope || [];
        this.pushChunkSize = pushChunkSize;
        this.pullPageSize = pullPageSize;
        this.appVersion = appVersion;
    }

    /**
     * Generate a temporary ID for local creates
     */
    generateTempId() {
        const timestamp = Date.now();
        // Prefer the CSPRNG: Math.random() can collide under rapid offline
        // creates. Keep the `local_<ts>_<hex>` shape (consumers rely on the
        // `local_` prefix and the isTempId check).
        const random = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).slice(2, 10);
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
     * Register this client with the sync server (POST sync/register).
     * Reuses the stored client_uuid when there is one, so it is safe to call
     * again (re-registration after a server-side purge).
     * The server reads the device from the token: the user must have gone
     * through device identification.
     * @returns {Object} {client_uuid, sync_scope}
     */
    async register() {
        const clientUuid = (await this.storage.getClientUuid()) || generateUuid();
        let result;
        try {
            result = await this.api.register(clientUuid, this.scope, this.appVersion);
        } catch (error) {
            logger.error('sync/register failed:', error);
            if (isForbiddenError(error)) throw new ForbiddenSyncError();
            throw error;
        }

        await this.storage.setClientUuid(clientUuid);
        await this.storage.setSyncScope(result?.sync_scope ?? null);

        return {
            client_uuid: clientUuid,
            sync_scope: result?.sync_scope ?? null
        };
    }

    /**
     * Check if this client is registered
     */
    async isRegistered() {
        const clientUuid = await this.storage.getClientUuid();
        return clientUuid !== null;
    }

    /**
     * Makes sure the API carries a registered client_uuid, registering on
     * first use.
     */
    async ensureRegistered() {
        const clientUuid = await this.storage.getClientUuid();
        if (clientUuid) {
            this.api.setClientUuid(clientUuid);
            return clientUuid;
        }
        const { client_uuid: registered } = await this.register();
        return registered;
    }

    /**
     * Runs a client-bound request; if the server no longer knows the client
     * (database reset, client purged), registers again and retries once.
     */
    async _withClient(request) {
        try {
            return await request();
        } catch (error) {
            if (!isClientNotRegistered(error)) throw error;
            logger.warning('Sync client unknown to the server, registering again');
            await this.register();
            return await request();
        }
    }

    // ==================== FULL SYNC ====================

    /**
     * Perform a complete sync: push local changes, then pull server changes
     * @returns {Object} {pushed, pulled, conflicts, errors}
     */
    async sync() {
        const result = {
            pushed: { success: 0, conflicts: [], errors: [], id_mappings: {} },
            pulled: { updated: 0, deleted: 0, errors: [] },
            conflicts: [],
            errors: []
        };

        const _t0 = perfNow();
        const _stack = syncCallStack();
        if (this.storage.resetOpStats) this.storage.resetOpStats();
        syncLog('sync start, scope=', this.scope, '\nTriggered from:\n' + _stack);

        await this.ensureRegistered();

        // Step 1: Push local changes
        result.pushed = await this.push();
        result.conflicts = result.pushed.conflicts;

        // Step 2: Pull server changes
        result.pulled = await this.pull();
        result.errors = [...result.pushed.errors, ...result.pulled.errors];

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
     * Push local pending changes to the server, one object type per request
     * and at most pushChunkSize changes per request.
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

        await this.ensureRegistered();

        const changes = await this._coalesce(pendingChanges);
        const tables = this._pushTableOrder(changes);
        let requests = 0;

        for (const action of ACTION_ORDER) {
            const tableOrder = action === 'delete' ? [...tables].reverse() : tables;
            for (const table of tableOrder) {
                const batch = changes.filter(c => c.table === table && c.action === action);
                for (const chunk of this._chunkArray(batch, this.pushChunkSize)) {
                    // Resolve any temp_id minted by an earlier request before
                    // sending this one, so an FK reference (or an update/delete
                    // of an entity created earlier in this same push) reaches
                    // the server with the real id instead of a stale temp_id.
                    const sendable = [];
                    for (const change of chunk) {
                        const remapped = this._remapChange(change, result.id_mappings);
                        const blocker = this._unresolvedTempId(remapped);
                        if (blocker) {
                            // Its parent create failed or is still pending:
                            // keep it queued for the next push.
                            logger.warning(`push ${table}/${remapped.action}: waits for ${blocker} to be created`);
                            result.errors.push({ table, id: remapped.id, temp_id: remapped.temp_id, error: 'WAITING_FOR_PARENT', message: `${blocker} is not created yet` });
                            continue;
                        }
                        sendable.push(remapped);
                    }
                    if (sendable.length === 0) continue;

                    requests++;
                    const chunkResult = await this._pushChunk(table, sendable);
                    result.success += chunkResult.success;
                    result.conflicts.push(...chunkResult.conflicts);
                    result.errors.push(...chunkResult.errors);
                    Object.assign(result.id_mappings, chunkResult.id_mappings);
                }
            }
        }

        // Apply ID mappings to remaining pending changes and entities
        if (Object.keys(result.id_mappings).length > 0) {
            await this._applyIdMappings(result.id_mappings);
        }

        const opsAfter = this.storage.getOpStats ? this.storage.getOpStats().total : null;
        const idbOps = (opsAfter !== null && _opsBefore !== null) ? opsAfter - _opsBefore : null;
        syncLog(
            `push done in ${Math.round(perfNow() - _t0)}ms`,
            `| pending=${pendingChanges.length} coalesced=${changes.length} requests=${requests}`,
            `| success=${result.success} conflicts=${result.conflicts.length} errors=${result.errors.length}`,
            `| id_mappings=${Object.keys(result.id_mappings).length}`,
            `| idb ops (~= transactions)=${idbOps}`
        );
        syncAlarm('push', idbOps, _stack,
            `(pending=${pendingChanges.length}, requests=${requests}, success=${result.success})`);

        return result;
    }

    /**
     * Folds the queue into one change per entity, in queue order:
     * create + updates -> one create, updates -> one update (oldest base_tms),
     * update + delete -> one delete. Sending each queued update separately
     * would make the second one look like a conflict: the first already moved
     * the server tms past its base_tms.
     * Updates of a temp entity whose create is gone (deleted before any push)
     * are dropped from the queue.
     */
    async _coalesce(pendingChanges) {
        const ordered = [...pendingChanges].sort((a, b) => (a.queue_id ?? 0) - (b.queue_id ?? 0));
        const groups = new Map();
        const result = [];

        for (const change of ordered) {
            const key = `${change.table}|${change.action === 'create' ? change.temp_id : change.id}`;
            const current = groups.get(key);

            if (!current) {
                const group = { ...change, data: change.data ? { ...change.data } : change.data, queue_ids: [change.queue_id] };
                groups.set(key, group);
                result.push(group);
                continue;
            }

            current.queue_ids.push(change.queue_id);
            if (current.action === 'delete') {
                continue;
            }
            if (change.action === 'update') {
                current.data = { ...(current.data || {}), ...(change.data || {}) };
            } else if (change.action === 'delete') {
                current.action = 'delete';
                current.data = null;
            }
        }

        const orphans = result.filter(c => c.action !== 'create' && this.isTempId(c.id));
        for (const orphan of orphans) {
            logger.warning(`Dropping ${orphan.queue_ids.length} queued change(s) for ${orphan.table}/${orphan.id}: its create is no longer queued`);
            await this.storage.deletePendingChanges(orphan.queue_ids);
        }

        return result.filter(c => !orphans.includes(c));
    }

    /** Object types in scope order, then any other type found in the queue. */
    _pushTableOrder(changes) {
        const tables = [...this.scope];
        for (const change of changes) {
            if (!tables.includes(change.table)) tables.push(change.table);
        }
        return tables;
    }

    /** First temp_id still referenced by a change (its target or an FK), or null. */
    _unresolvedTempId(change) {
        if (change.action !== 'create' && this.isTempId(change.id)) return change.id;
        if (change.data && typeof change.data === 'object') {
            for (const value of Object.values(change.data)) {
                if (this.isTempId(value)) return value;
            }
        }
        return null;
    }

    /**
     * Push a single chunk of changes of one object type
     */
    async _pushChunk(table, changes) {
        const result = {
            success: 0,
            conflicts: [],
            errors: [],
            id_mappings: {}
        };

        const apiChanges = changes.map(change => ({
            action: change.action,
            id: change.action === 'create' ? 0 : change.id,
            ...(change.action === 'create' ? { temp_id: change.temp_id } : {}),
            base_tms: change.base_tms ?? null,
            data: change.data || {}
        }));

        let response;
        try {
            response = await this._withClient(() => this.api.push(table, apiChanges));
        } catch (error) {
            if (isForbiddenError(error)) {
                logger.error(`sync/push ${table} refused (403), stopping sync`);
                throw new ForbiddenSyncError();
            }
            // Network or server error - keep changes pending for retry
            logger.error(`sync/push ${table} failed, ${changes.length} change(s) kept pending:`, error);
            result.errors.push({ table, error: 'PUSH_FAILED', message: error.message, status: error.status ?? null });
            return result;
        }

        const successIds = new Set((response?.success || []).map(String));
        const idMapping = (response?.id_mapping && !Array.isArray(response.id_mapping)) ? response.id_mapping : {};
        const conflictsById = new Map((response?.conflicts || []).map(c => [String(c.object_id), c]));
        const errorsById = new Map();
        const errorsByTempId = new Map();
        for (const error of response?.errors || []) {
            if (error.temp_id) errorsByTempId.set(String(error.temp_id), error);
            else errorsById.set(String(error.id), error);
        }

        for (const change of changes) {
            if (change.action === 'create') {
                const serverId = idMapping[change.temp_id];
                if (serverId !== undefined && serverId !== null) {
                    await this._commitCreate(table, change, serverId);
                    result.id_mappings[change.temp_id] = serverId;
                    result.success++;
                } else {
                    const error = errorsByTempId.get(String(change.temp_id));
                    const message = error?.error || 'No result returned for this change';
                    logger.error(`push ${table} create ${change.temp_id} failed: ${message}`);
                    result.errors.push({ table, temp_id: change.temp_id, error: message });
                }
                continue;
            }

            const key = String(change.id);
            const conflict = conflictsById.get(key);
            const error = errorsById.get(key);

            if (conflict) {
                result.conflicts.push(await this._recordPushConflict(table, change, conflict));
            } else if (error) {
                logger.error(`push ${table} ${change.action} ${change.id} failed: ${error.error}`);
                if (error.error === OBJECT_NOT_FOUND) {
                    // Gone (or no longer visible) server-side: nothing to retry.
                    await this.storage.deletePendingChanges(change.queue_ids);
                    await this.storage.deleteEntity(table, change.id);
                }
                result.errors.push({ table, id: change.id, error: error.error });
            } else if (successIds.has(key)) {
                await this.storage.deletePendingChanges(change.queue_ids);
                if (change.action === 'update') {
                    // The server tms moved: the next pull brings the fresh row,
                    // which may only overwrite an entity without local changes.
                    const entity = await this.storage.getEntity(table, change.id);
                    if (entity) {
                        await this.storage.putEntity(table, change.id, entity.data, entity.server_tms, null);
                    }
                }
                result.success++;
            } else {
                logger.error(`push ${table} ${change.action} ${change.id}: no result returned, kept pending`);
                result.errors.push({ table, id: change.id, error: 'No result returned for this change' });
            }
        }

        return result;
    }

    /** Re-keys a created entity from its temp_id to the server id. */
    async _commitCreate(table, change, serverId) {
        await this.storage.deletePendingChanges(change.queue_ids);
        const entity = await this.storage.getEntity(table, change.temp_id);
        if (entity) {
            await this.storage.deleteEntity(table, change.temp_id);
            // No server tms in the push response: the next pull fills it.
            await this.storage.putEntity(table, serverId, { ...entity.data, id: serverId }, null, null);
        }
    }

    /**
     * Stores a conflict reported by sync/push. The server records update
     * conflicts (they get an id in sync/conflicts) but not delete ones, so the
     * local record starts with a local id; getConflicts() swaps it for the
     * server id once it shows up there.
     */
    async _recordPushConflict(table, change, conflict) {
        const record = {
            conflict_id: `${LOCAL_CONFLICT_PREFIX}${table}:${change.id}`,
            table,
            object_id: change.id,
            action: conflict.action || change.action,
            client_data: change.data || {},
            server_data: null,
            client_tms: conflict.client_tms ?? change.base_tms ?? null,
            server_tms: conflict.server_tms ?? null,
            field_conflicts: conflictFieldNames(conflict.field_conflicts),
            field_conflict_details: conflict.field_conflicts || null,
            created_at: new Date().toISOString()
        };
        await this.storage.addConflict(record);
        // The conflict is now tracked separately; the entity keeps its local
        // changes (local_updated_at) so a pull does not overwrite them.
        await this.storage.deletePendingChanges(change.queue_ids);
        return record;
    }

    /**
     * Return a copy of a pending change with temp_id references resolved to
     * their server id via the accumulated id_mappings: both FK values inside
     * `data` and the change's own target `id` (an update/delete of an entity
     * created earlier in the same push under a temp_id). Returns the change
     * untouched when there is nothing to remap.
     */
    _remapChange(change, idMappings) {
        if (!idMappings || Object.keys(idMappings).length === 0) {
            return change;
        }
        let remapped = change;

        if (change.data && typeof change.data === 'object') {
            let dataChanged = false;
            const newData = { ...change.data };
            for (const [field, value] of Object.entries(newData)) {
                if (this.isTempId(value) && idMappings[value]) {
                    newData[field] = idMappings[value];
                    dataChanged = true;
                }
            }
            if (dataChanged) {
                remapped = { ...remapped, data: newData };
            }
        }

        if (this.isTempId(remapped.id) && idMappings[remapped.id]) {
            remapped = { ...remapped, id: idMappings[remapped.id] };
        }

        return remapped;
    }

    /**
     * Apply ID mappings to entities and to the changes still queued (FK values
     * and target ids), so the next push no longer refers to temp_ids.
     */
    async _applyIdMappings(idMappings) {
        for (const table of this.scope) {
            const entities = await this.storage.getEntitiesByTable(table);

            for (const entity of entities) {
                let updated = false;
                const newData = { ...entity.data };

                for (const [field, value] of Object.entries(newData)) {
                    if (field !== 'id' && this.isTempId(value) && idMappings[value]) {
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

        const pendingChanges = await this.storage.getPendingChanges();
        for (const change of pendingChanges) {
            const remapped = this._remapChange(change, idMappings);
            if (remapped !== change) {
                await this.storage.deletePendingChange(change.queue_id);
                await this.storage.addPendingChange({
                    ...remapped,
                    queue_id: undefined // Let it auto-generate
                });
            }
        }
    }

    // ==================== PULL ====================

    /**
     * Pull server changes, one object type at a time, following next_cursor
     * until has_more is false. Each type keeps its own watermark, advanced
     * only once all its pages are applied. A failing type is reported in
     * `errors` and does not stop the others; a 403 stops everything.
     * @returns {Object} {updated, deleted, errors}
     */
    async pull() {
        const result = { updated: 0, deleted: 0, errors: [] };

        const _t0 = perfNow();
        const _stack = syncCallStack();
        const _opsBefore = this.storage.getOpStats ? this.storage.getOpStats().total : null;
        const _perTable = {};
        let _pages = 0;
        let latestServerTime = null;

        await this.ensureRegistered();

        for (const table of this.scope) {
            const stats = (_perTable[table] = { updated: 0, deleted: 0 });
            const lastSyncAt = (await this.storage.getMeta(watermarkKey(table))) || FULL_PULL_SINCE;
            let cursor = null;
            let serverTime = null;

            try {
                do {
                    const page = await this._withClient(() => this.api.pull(table, {
                        lastSyncAt,
                        limit: this.pullPageSize,
                        cursor
                    }));
                    _pages++;

                    for (const row of page?.updated || []) {
                        const id = row.id ?? row.rowid;
                        const existing = await this.storage.getEntity(table, id);
                        if (existing && existing.local_updated_at) {
                            // Local modification exists - don't overwrite, will be handled on push
                            continue;
                        }
                        await this.storage.putEntity(table, id, row, row.tms ?? null, null);
                        result.updated++;
                        stats.updated++;
                    }

                    for (const tombstone of page?.deleted || []) {
                        const existing = await this.storage.getEntity(table, tombstone.id);
                        if (existing && existing.local_updated_at) {
                            // Will surface as a conflict on push
                            continue;
                        }
                        await this.storage.deleteEntity(table, tombstone.id);
                        result.deleted++;
                        stats.deleted++;
                    }

                    // Remember the server snapshot time but DON'T commit it
                    // yet: writing it per page would, on a crash between pages,
                    // advance the watermark past data never received.
                    if (page?.server_time) {
                        serverTime = page.server_time;
                    }

                    if (page?.has_more && !page.next_cursor) {
                        throw new Error(`sync/pull ${table}: has_more without next_cursor`);
                    }
                    cursor = page?.has_more ? page.next_cursor : null;
                } while (cursor);
            } catch (error) {
                if (isForbiddenError(error)) {
                    logger.error(`sync/pull ${table} refused (403), stopping sync`);
                    throw new ForbiddenSyncError();
                }
                logger.error(`sync/pull ${table} failed, watermark kept:`, error);
                result.errors.push({ table, error: 'PULL_FAILED', message: error.message, status: error.status ?? null });
                continue;
            }

            if (serverTime) {
                await this.storage.setMeta(watermarkKey(table), serverTime);
                latestServerTime = serverTime;
            }
        }

        // Overall "last sync" shown to the user: only when every type made it.
        if (latestServerTime && result.errors.length === 0) {
            await this.storage.setLastSyncTime(latestServerTime);
        }

        const opsAfter = this.storage.getOpStats ? this.storage.getOpStats().total : null;
        const idbOps = (opsAfter !== null && _opsBefore !== null) ? opsAfter - _opsBefore : null;
        syncLog(
            `pull done in ${Math.round(perfNow() - _t0)}ms`,
            `| pages=${_pages}`,
            `| updated=${result.updated} deleted=${result.deleted} errors=${result.errors.length}`,
            '| per-table=', _perTable,
            `| idb ops (~= transactions)=${idbOps}`
        );
        syncAlarm('pull', idbOps, _stack,
            `(pages=${_pages}, updated=${result.updated}, deleted=${result.deleted}, per-table=${JSON.stringify(_perTable)})`);

        return result;
    }

    /**
     * Moves a type's watermark back to just before `tms`, so the next pull
     * brings that row again. Never moves it forward.
     */
    async _rewindWatermark(table, tms) {
        const target = Date.parse(tms);
        if (!table || Number.isNaN(target)) {
            return;
        }
        const current = await this.storage.getMeta(watermarkKey(table));
        if (current && Date.parse(current) <= target - 1000) {
            return;
        }
        await this.storage.setMeta(watermarkKey(table), toServerTimestamp(target - 1000));
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
     * Pending conflicts: the server list (sync/conflicts) merged with the
     * local records, which carry the local object type. Offline, returns the
     * local records only.
     */
    async getConflicts() {
        const localConflicts = await this.storage.getConflicts();

        let serverResponse;
        try {
            await this.ensureRegistered();
            serverResponse = await this._withClient(() => this.api.getConflicts());
        } catch (error) {
            if (isForbiddenError(error)) {
                logger.error('sync/conflicts refused (403)');
                throw new ForbiddenSyncError();
            }
            logger.warning('sync/conflicts unavailable, returning local conflicts only:', error);
            return localConflicts;
        }

        const merged = [];
        const matched = new Set();

        for (const serverConflict of serverResponse?.conflicts || []) {
            const objectId = String(serverConflict.object_id);
            const candidates = localConflicts.filter(local =>
                !matched.has(local.conflict_id)
                && String(local.object_id) === objectId
                && (!serverConflict.object_type || local.table === serverConflict.object_type)
            );
            const local = candidates.find(c => String(c.conflict_id) === String(serverConflict.id))
                || candidates.find(c => isLocalConflictId(c.conflict_id) && c.action !== 'delete')
                || null;

            const record = {
                conflict_id: serverConflict.id,
                table: serverConflict.object_type || local?.table || null,
                table_name: serverConflict.table_name,
                object_id: serverConflict.object_id,
                action: local?.action || 'update',
                client_data: serverConflict.client_data || {},
                server_data: serverConflict.server_data || {},
                client_tms: serverConflict.client_tms,
                server_tms: serverConflict.server_tms,
                field_conflicts: conflictFieldNames(serverConflict.field_conflicts),
                field_conflict_details: serverConflict.field_conflicts || null,
                created_at: local?.created_at || serverConflict.date_creation || new Date().toISOString()
            };

            if (local) {
                matched.add(local.conflict_id);
                if (String(local.conflict_id) !== String(record.conflict_id)) {
                    await this.storage.deleteConflict(local.conflict_id);
                }
            }
            await this.storage.addConflict(record);
            merged.push(record);
        }

        for (const local of localConflicts) {
            if (matched.has(local.conflict_id)) continue;
            if (isLocalConflictId(local.conflict_id)) {
                // Not (yet) known to the server: delete conflicts never are.
                merged.push(local);
                continue;
            }
            // Had a server id but is no longer pending there: resolved
            // elsewhere. Release the entity so the next pull refreshes it.
            logger.info(`Conflict ${local.conflict_id} no longer pending on the server, dropping it`);
            await this.storage.deleteConflict(local.conflict_id);
            await this._releaseEntity(local.table, local.object_id, local.server_tms);
        }

        return merged;
    }

    /**
     * Resolve a conflict.
     * Server-recorded conflicts are resolved through sync/conflicts/{id}/resolve.
     * Local-only ones (delete conflicts) are resolved by queueing the winning
     * change again: 'client' re-sends it against the current server tms,
     * 'server' drops it and pulls the server row again.
     *
     * @param {number|string} conflictId - conflict_id from getConflicts()
     * @param {string} resolution - 'client', 'server', or 'merged'
     * @param {Object|null} data - Merged data (required for 'merged')
     */
    async resolveConflict(conflictId, resolution, data = null) {
        if (!['client', 'server', 'merged'].includes(resolution)) {
            throw new Error(`Invalid resolution: ${resolution}`);
        }
        if (resolution === 'merged' && (!data || typeof data !== 'object')) {
            throw new Error('Merged data is required for a merged resolution');
        }

        let id = conflictId;
        let conflict = await this.storage.getConflict(id);

        // An update conflict pushed earlier: look for its server id first.
        if (isLocalConflictId(id) && conflict && conflict.action !== 'delete') {
            const refreshed = await this.getConflicts();
            const serverSide = refreshed.find(c =>
                !isLocalConflictId(c.conflict_id)
                && String(c.object_id) === String(conflict.object_id)
                && (!c.table || c.table === conflict.table)
            );
            if (serverSide) {
                id = serverSide.conflict_id;
                conflict = serverSide;
            }
        }

        if (!isLocalConflictId(id)) {
            const result = await this._withClient(() => this.api.resolveConflict(id, resolution, data));
            if (conflict) {
                await this._applyResolutionLocally(conflict, resolution, data);
            } else {
                logger.warning(`Conflict ${id} resolved on the server, no local record to update`);
            }
            await this.storage.deleteConflict(id);
            return result;
        }

        if (!conflict) {
            throw new Error(`Conflict not found: ${conflictId}`);
        }
        await this._resolveLocally(conflict, resolution, data);
        await this.storage.deleteConflict(id);
        return { success: true, local: true };
    }

    /** Mirrors a server-side resolution in the local entity. */
    async _applyResolutionLocally(conflict, resolution, data) {
        const { table, object_id: objectId } = conflict;
        if (!table) {
            logger.warning(`Conflict ${conflict.conflict_id}: unknown local type, the next pull will refresh object ${objectId}`);
            return;
        }
        const entity = await this.storage.getEntity(table, objectId);
        if (entity) {
            const winner = resolution === 'server'
                ? {}
                : (resolution === 'client' ? conflict.client_data : data);
            await this.storage.putEntity(table, objectId, { ...entity.data, ...(winner || {}) }, null, null);
        }
        if (resolution === 'server') {
            await this._rewindWatermark(table, conflict.server_tms);
        }
    }

    /** Resolution of a conflict the server never recorded. */
    async _resolveLocally(conflict, resolution, data) {
        const { table, object_id: objectId, action } = conflict;

        if (resolution === 'server') {
            await this._releaseEntity(table, objectId, conflict.server_tms);
            return;
        }
        if (action === 'delete') {
            if (resolution === 'merged') {
                throw new Error('A delete conflict cannot be merged: choose client or server');
            }
            await this.storage.addPendingChange({ table, action: 'delete', id: objectId, base_tms: conflict.server_tms, data: null });
            return;
        }
        await this.storage.addPendingChange({
            table,
            action: 'update',
            id: objectId,
            base_tms: conflict.server_tms,
            data: resolution === 'client' ? conflict.client_data : data
        });
    }

    /** Drops the local changes of an entity and pulls its server row again. */
    async _releaseEntity(table, objectId, serverTms) {
        if (!table) return;
        const entity = await this.storage.getEntity(table, objectId);
        if (entity) {
            await this.storage.putEntity(table, objectId, entity.data, entity.server_tms, null);
        }
        await this._rewindWatermark(table, serverTms);
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
     * Get local sync status
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
     * Server-side status of this client (GET sync/status)
     */
    async getServerStatus() {
        await this.ensureRegistered();
        return await this._withClient(() => this.api.getStatus());
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
