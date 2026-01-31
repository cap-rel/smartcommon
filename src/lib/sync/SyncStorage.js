import Dexie from 'dexie';

/**
 * SyncStorage - IndexedDB storage layer for offline sync
 * Uses Dexie for simplified IndexedDB operations and migrations
 */
class SyncStorage {
    constructor(dbName = 'smartauth_sync') {
        this.dbName = dbName;
        this.db = null;
    }

    /**
     * Initialize the database with schema v1
     */
    async init() {
        this.db = new Dexie(this.dbName);

        this.db.version(1).stores({
            // Cached business entities
            // Compound key: [table, id]
            entities: '[table+id], table, server_tms, local_updated_at',

            // Pending changes waiting to be pushed
            // Auto-increment key: queue_id
            pending_changes: '++queue_id, table, created_at',

            // Conflicts waiting for resolution
            pending_conflicts: 'conflict_id, table, created_at',

            // Sync metadata (key-value store)
            sync_meta: 'key',

            // Local tombstones (deletions made offline)
            // Compound key: [table, id]
            local_tombstones: '[table+id]'
        });

        await this.db.open();
        return this;
    }

    // ==================== ENTITIES ====================

    /**
     * Get a single entity by table and id
     */
    async getEntity(table, id) {
        const entity = await this.db.entities.get([table, id]);
        return entity || null;
    }

    /**
     * Store or update an entity
     */
    async putEntity(table, id, data, serverTms, localUpdatedAt = null) {
        const entity = {
            table,
            id,
            data,
            server_tms: serverTms,
            local_updated_at: localUpdatedAt
        };
        await this.db.entities.put(entity);
        return entity;
    }

    /**
     * Delete an entity
     */
    async deleteEntity(table, id) {
        await this.db.entities.delete([table, id]);
    }

    /**
     * Get all entities for a given table
     */
    async getEntitiesByTable(table) {
        return await this.db.entities.where('table').equals(table).toArray();
    }

    /**
     * Get entities that have been modified locally (local_updated_at != null)
     */
    async getModifiedEntities() {
        return await this.db.entities
            .where('local_updated_at')
            .notEqual(null)
            .toArray();
    }

    /**
     * Update entity data and mark as locally modified
     */
    async updateEntityLocal(table, id, data) {
        const existing = await this.getEntity(table, id);
        if (!existing) {
            return null;
        }

        const updated = {
            ...existing,
            data: { ...existing.data, ...data },
            local_updated_at: new Date().toISOString()
        };

        await this.db.entities.put(updated);
        return updated;
    }

    // ==================== PENDING CHANGES ====================

    /**
     * Add a pending change to the queue
     * @param {Object} change - {table, id, action, base_tms, data, temp_id?}
     */
    async addPendingChange(change) {
        const record = {
            ...change,
            created_at: new Date().toISOString()
        };
        const queueId = await this.db.pending_changes.add(record);
        return { ...record, queue_id: queueId };
    }

    /**
     * Get all pending changes ordered by creation time
     */
    async getPendingChanges() {
        return await this.db.pending_changes.orderBy('created_at').toArray();
    }

    /**
     * Get count of pending changes
     */
    async getPendingChangesCount() {
        return await this.db.pending_changes.count();
    }

    /**
     * Delete a pending change by queue_id
     */
    async deletePendingChange(queueId) {
        await this.db.pending_changes.delete(queueId);
    }

    /**
     * Delete multiple pending changes
     */
    async deletePendingChanges(queueIds) {
        await this.db.pending_changes.bulkDelete(queueIds);
    }

    /**
     * Clear all pending changes
     */
    async clearPendingChanges() {
        await this.db.pending_changes.clear();
    }

    // ==================== CONFLICTS ====================

    /**
     * Add a conflict to the pending conflicts store
     */
    async addConflict(conflict) {
        const record = {
            ...conflict,
            created_at: conflict.created_at || new Date().toISOString()
        };
        await this.db.pending_conflicts.put(record);
        return record;
    }

    /**
     * Get all pending conflicts
     */
    async getConflicts() {
        return await this.db.pending_conflicts.orderBy('created_at').toArray();
    }

    /**
     * Get count of pending conflicts
     */
    async getConflictsCount() {
        return await this.db.pending_conflicts.count();
    }

    /**
     * Get a single conflict by id
     */
    async getConflict(conflictId) {
        return await this.db.pending_conflicts.get(conflictId);
    }

    /**
     * Delete a conflict by id
     */
    async deleteConflict(conflictId) {
        await this.db.pending_conflicts.delete(conflictId);
    }

    /**
     * Clear all conflicts
     */
    async clearConflicts() {
        await this.db.pending_conflicts.clear();
    }

    // ==================== SYNC META ====================

    /**
     * Get a metadata value by key
     */
    async getMeta(key) {
        const record = await this.db.sync_meta.get(key);
        return record ? record.value : null;
    }

    /**
     * Set a metadata value
     */
    async setMeta(key, value) {
        await this.db.sync_meta.put({ key, value });
    }

    /**
     * Delete a metadata entry
     */
    async deleteMeta(key) {
        await this.db.sync_meta.delete(key);
    }

    /**
     * Get last sync timestamp
     */
    async getLastSyncTime() {
        return await this.getMeta('last_sync_at');
    }

    /**
     * Set last sync timestamp
     */
    async setLastSyncTime(timestamp) {
        await this.setMeta('last_sync_at', timestamp);
    }

    /**
     * Get client UUID
     */
    async getClientUuid() {
        return await this.getMeta('client_uuid');
    }

    /**
     * Set client UUID
     */
    async setClientUuid(uuid) {
        await this.setMeta('client_uuid', uuid);
    }

    /**
     * Get sync scope (list of enabled tables)
     */
    async getSyncScope() {
        return await this.getMeta('sync_scope');
    }

    /**
     * Set sync scope
     */
    async setSyncScope(scope) {
        await this.setMeta('sync_scope', scope);
    }

    // ==================== TOMBSTONES ====================

    /**
     * Add a local tombstone (deletion made offline)
     */
    async addTombstone(table, id, deletedAt = null) {
        const record = {
            table,
            id,
            deleted_at: deletedAt || new Date().toISOString()
        };
        await this.db.local_tombstones.put(record);
        return record;
    }

    /**
     * Get all local tombstones
     */
    async getTombstones() {
        return await this.db.local_tombstones.toArray();
    }

    /**
     * Check if an entity has a tombstone
     */
    async hasTombstone(table, id) {
        const tombstone = await this.db.local_tombstones.get([table, id]);
        return tombstone !== undefined;
    }

    /**
     * Delete a specific tombstone
     */
    async deleteTombstone(table, id) {
        await this.db.local_tombstones.delete([table, id]);
    }

    /**
     * Clear all tombstones (called after successful sync)
     */
    async clearTombstones() {
        await this.db.local_tombstones.clear();
    }

    // ==================== MAINTENANCE ====================

    /**
     * Clear all data from all stores
     */
    async clear() {
        await Promise.all([
            this.db.entities.clear(),
            this.db.pending_changes.clear(),
            this.db.pending_conflicts.clear(),
            this.db.sync_meta.clear(),
            this.db.local_tombstones.clear()
        ]);
    }

    /**
     * Get statistics about stored data
     */
    async getStats() {
        const [entities, pendingChanges, conflicts, tombstones] = await Promise.all([
            this.db.entities.count(),
            this.db.pending_changes.count(),
            this.db.pending_conflicts.count(),
            this.db.local_tombstones.count()
        ]);

        return {
            entities,
            pending_changes: pendingChanges,
            conflicts,
            tombstones
        };
    }

    /**
     * Get entity counts grouped by table
     */
    async getEntitiesCountByTable() {
        const entities = await this.db.entities.toArray();
        const counts = {};

        for (const entity of entities) {
            counts[entity.table] = (counts[entity.table] || 0) + 1;
        }

        return counts;
    }

    /**
     * Close the database connection
     */
    close() {
        if (this.db) {
            this.db.close();
        }
    }

    /**
     * Delete the entire database
     */
    async deleteDatabase() {
        this.close();
        await Dexie.delete(this.dbName);
    }
}

export { SyncStorage };
export default SyncStorage;
