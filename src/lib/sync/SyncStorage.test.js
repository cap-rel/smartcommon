import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { SyncStorage } from './SyncStorage';

describe('SyncStorage', () => {
    let storage;

    beforeEach(async () => {
        storage = new SyncStorage('test_sync_db');
        await storage.init();
    });

    afterEach(async () => {
        await storage.deleteDatabase();
    });

    describe('initialization', () => {
        it('should initialize database successfully', async () => {
            expect(storage.db).toBeDefined();
            expect(storage.dbName).toBe('test_sync_db');
        });
    });

    describe('entities', () => {
        it('finds an entity stored with a string id when asked with a number, and back', async () => {
            await storage.putEntity('product', '1', { label: 'from server' }, 't1');
            await storage.putEntity('product', 2, { label: 'from app' }, 't2');

            expect((await storage.getEntity('product', 1))?.data.label).toBe('from server');
            expect((await storage.getEntity('product', '2'))?.data.label).toBe('from app');
        });

        it('updates the existing row instead of adding a copy under the other id type', async () => {
            await storage.putEntity('product', '1', { label: 'v1' }, 't1');
            await storage.putEntity('product', 1, { label: 'v2' }, 't2');

            const rows = await storage.getEntitiesByTable('product');
            expect(rows).toHaveLength(1);
            expect(rows[0]).toMatchObject({ id: '1', data: { label: 'v2' } });
        });

        it('deletes an entity and its tombstone whatever the id type', async () => {
            await storage.putEntity('product', '3', { label: 'x' }, 't');
            await storage.addTombstone('product', '3');

            expect(await storage.hasTombstone('product', 3)).toBe(true);
            await storage.deleteEntity('product', 3);
            await storage.deleteTombstone('product', 3);

            expect(await storage.getEntity('product', '3')).toBeNull();
            expect(await storage.hasTombstone('product', '3')).toBe(false);
        });

        it('keeps non numeric ids exact', async () => {
            await storage.putEntity('product', 'temp_abc', { label: 'new' }, null);
            expect((await storage.getEntity('product', 'temp_abc'))?.data.label).toBe('new');
        });

        it('should store and retrieve an entity', async () => {
            await storage.putEntity('thirdparty', 123, { name: 'Test Company' }, '2024-01-01T00:00:00Z');

            const entity = await storage.getEntity('thirdparty', 123);

            expect(entity).not.toBeNull();
            expect(entity.table).toBe('thirdparty');
            expect(entity.id).toBe(123);
            expect(entity.data.name).toBe('Test Company');
            expect(entity.server_tms).toBe('2024-01-01T00:00:00Z');
        });

        it('should return null for non-existent entity', async () => {
            const entity = await storage.getEntity('thirdparty', 999);
            expect(entity).toBeNull();
        });

        it('should delete an entity', async () => {
            await storage.putEntity('thirdparty', 123, { name: 'Test' }, '2024-01-01T00:00:00Z');
            await storage.deleteEntity('thirdparty', 123);

            const entity = await storage.getEntity('thirdparty', 123);
            expect(entity).toBeNull();
        });

        it('should get all entities by table', async () => {
            await storage.putEntity('thirdparty', 1, { name: 'Company 1' }, '2024-01-01T00:00:00Z');
            await storage.putEntity('thirdparty', 2, { name: 'Company 2' }, '2024-01-01T00:00:00Z');
            await storage.putEntity('contact', 10, { name: 'John' }, '2024-01-01T00:00:00Z');

            const entities = await storage.getEntitiesByTable('thirdparty');

            expect(entities).toHaveLength(2);
            expect(entities.map(e => e.id)).toContain(1);
            expect(entities.map(e => e.id)).toContain(2);
        });

        it('should update entity locally', async () => {
            await storage.putEntity('thirdparty', 123, { name: 'Old Name', email: 'test@test.com' }, '2024-01-01T00:00:00Z');

            const updated = await storage.updateEntityLocal('thirdparty', 123, { name: 'New Name' });

            expect(updated.data.name).toBe('New Name');
            expect(updated.data.email).toBe('test@test.com');
            expect(updated.local_updated_at).not.toBeNull();
        });

        it('should return null when updating non-existent entity', async () => {
            const result = await storage.updateEntityLocal('thirdparty', 999, { name: 'Test' });
            expect(result).toBeNull();
        });

        // Note: getModifiedEntities uses .notEqual(null) which has issues with fake-indexeddb
        // The functionality is tested indirectly through updateEntityLocal tests
    });

    describe('pending changes', () => {
        it('should add a pending change', async () => {
            const change = await storage.addPendingChange({
                table: 'thirdparty',
                action: 'create',
                temp_id: 'local_123',
                data: { name: 'New Company' }
            });

            expect(change.queue_id).toBeDefined();
            expect(change.created_at).toBeDefined();
            expect(change.table).toBe('thirdparty');
        });

        it('should get all pending changes ordered by creation', async () => {
            await storage.addPendingChange({ table: 'thirdparty', action: 'create', data: { name: 'First' } });
            await storage.addPendingChange({ table: 'contact', action: 'update', id: 1, data: { name: 'Second' } });

            const changes = await storage.getPendingChanges();

            expect(changes).toHaveLength(2);
            expect(changes[0].data.name).toBe('First');
            expect(changes[1].data.name).toBe('Second');
        });

        it('should get pending changes count', async () => {
            await storage.addPendingChange({ table: 'thirdparty', action: 'create', data: {} });
            await storage.addPendingChange({ table: 'contact', action: 'update', id: 1, data: {} });

            const count = await storage.getPendingChangesCount();
            expect(count).toBe(2);
        });

        it('should delete a pending change', async () => {
            const change = await storage.addPendingChange({ table: 'thirdparty', action: 'create', data: {} });
            await storage.deletePendingChange(change.queue_id);

            const changes = await storage.getPendingChanges();
            expect(changes).toHaveLength(0);
        });

        it('should delete multiple pending changes', async () => {
            const c1 = await storage.addPendingChange({ table: 'a', action: 'create', data: {} });
            const c2 = await storage.addPendingChange({ table: 'b', action: 'create', data: {} });
            await storage.addPendingChange({ table: 'c', action: 'create', data: {} });

            await storage.deletePendingChanges([c1.queue_id, c2.queue_id]);

            const changes = await storage.getPendingChanges();
            expect(changes).toHaveLength(1);
            expect(changes[0].table).toBe('c');
        });

        it('should clear all pending changes', async () => {
            await storage.addPendingChange({ table: 'a', action: 'create', data: {} });
            await storage.addPendingChange({ table: 'b', action: 'create', data: {} });

            await storage.clearPendingChanges();

            const count = await storage.getPendingChangesCount();
            expect(count).toBe(0);
        });
    });

    describe('conflicts', () => {
        it('should add and retrieve a conflict', async () => {
            const conflict = await storage.addConflict({
                conflict_id: 'conflict_1',
                table: 'thirdparty',
                object_id: 123,
                client_data: { name: 'Client Version' },
                server_data: { name: 'Server Version' }
            });

            expect(conflict.conflict_id).toBe('conflict_1');

            const retrieved = await storage.getConflict('conflict_1');
            expect(retrieved.table).toBe('thirdparty');
            expect(retrieved.client_data.name).toBe('Client Version');
        });

        it('should get all conflicts', async () => {
            await storage.addConflict({ conflict_id: 'c1', table: 'a', object_id: 1 });
            await storage.addConflict({ conflict_id: 'c2', table: 'b', object_id: 2 });

            const conflicts = await storage.getConflicts();
            expect(conflicts).toHaveLength(2);
        });

        it('should get conflicts count', async () => {
            await storage.addConflict({ conflict_id: 'c1', table: 'a', object_id: 1 });

            const count = await storage.getConflictsCount();
            expect(count).toBe(1);
        });

        it('should delete a conflict', async () => {
            await storage.addConflict({ conflict_id: 'c1', table: 'a', object_id: 1 });
            await storage.deleteConflict('c1');

            const conflict = await storage.getConflict('c1');
            expect(conflict).toBeUndefined();
        });

        it('should clear all conflicts', async () => {
            await storage.addConflict({ conflict_id: 'c1', table: 'a', object_id: 1 });
            await storage.addConflict({ conflict_id: 'c2', table: 'b', object_id: 2 });

            await storage.clearConflicts();

            const count = await storage.getConflictsCount();
            expect(count).toBe(0);
        });
    });

    describe('sync meta', () => {
        it('should get and set meta values', async () => {
            await storage.setMeta('test_key', 'test_value');

            const value = await storage.getMeta('test_key');
            expect(value).toBe('test_value');
        });

        it('should return null for non-existent meta', async () => {
            const value = await storage.getMeta('non_existent');
            expect(value).toBeNull();
        });

        it('should delete meta', async () => {
            await storage.setMeta('key', 'value');
            await storage.deleteMeta('key');

            const value = await storage.getMeta('key');
            expect(value).toBeNull();
        });

        it('should handle last sync time', async () => {
            await storage.setLastSyncTime('2024-01-15T10:30:00Z');

            const time = await storage.getLastSyncTime();
            expect(time).toBe('2024-01-15T10:30:00Z');
        });

        it('should handle client UUID', async () => {
            await storage.setClientUuid('uuid-123-456');

            const uuid = await storage.getClientUuid();
            expect(uuid).toBe('uuid-123-456');
        });

        it('should handle sync scope', async () => {
            await storage.setSyncScope(['thirdparty', 'contact']);

            const scope = await storage.getSyncScope();
            expect(scope).toEqual(['thirdparty', 'contact']);
        });
    });

    describe('tombstones', () => {
        it('should add and retrieve tombstones', async () => {
            await storage.addTombstone('thirdparty', 123);

            const tombstones = await storage.getTombstones();
            expect(tombstones).toHaveLength(1);
            expect(tombstones[0].table).toBe('thirdparty');
            expect(tombstones[0].id).toBe(123);
        });

        it('should check if tombstone exists', async () => {
            await storage.addTombstone('thirdparty', 123);

            const exists = await storage.hasTombstone('thirdparty', 123);
            const notExists = await storage.hasTombstone('thirdparty', 456);

            expect(exists).toBe(true);
            expect(notExists).toBe(false);
        });

        it('should delete a tombstone', async () => {
            await storage.addTombstone('thirdparty', 123);
            await storage.deleteTombstone('thirdparty', 123);

            const exists = await storage.hasTombstone('thirdparty', 123);
            expect(exists).toBe(false);
        });

        it('should clear all tombstones', async () => {
            await storage.addTombstone('a', 1);
            await storage.addTombstone('b', 2);

            await storage.clearTombstones();

            const tombstones = await storage.getTombstones();
            expect(tombstones).toHaveLength(0);
        });
    });

    describe('maintenance', () => {
        it('should clear all data', async () => {
            await storage.putEntity('thirdparty', 1, { name: 'Test' }, '2024-01-01T00:00:00Z');
            await storage.addPendingChange({ table: 'thirdparty', action: 'create', data: {} });
            await storage.addConflict({ conflict_id: 'c1', table: 'a', object_id: 1 });
            await storage.setMeta('key', 'value');
            await storage.addTombstone('a', 1);

            await storage.clear();

            const stats = await storage.getStats();
            expect(stats.entities).toBe(0);
            expect(stats.pending_changes).toBe(0);
            expect(stats.conflicts).toBe(0);
            expect(stats.tombstones).toBe(0);
        });

        it('should get statistics', async () => {
            await storage.putEntity('thirdparty', 1, { name: 'Test' }, '2024-01-01T00:00:00Z');
            await storage.putEntity('thirdparty', 2, { name: 'Test 2' }, '2024-01-01T00:00:00Z');
            await storage.addPendingChange({ table: 'thirdparty', action: 'create', data: {} });

            const stats = await storage.getStats();

            expect(stats.entities).toBe(2);
            expect(stats.pending_changes).toBe(1);
            expect(stats.conflicts).toBe(0);
            expect(stats.tombstones).toBe(0);
        });

        it('should get entity counts by table', async () => {
            await storage.putEntity('thirdparty', 1, {}, '2024-01-01T00:00:00Z');
            await storage.putEntity('thirdparty', 2, {}, '2024-01-01T00:00:00Z');
            await storage.putEntity('contact', 10, {}, '2024-01-01T00:00:00Z');

            const counts = await storage.getEntitiesCountByTable();

            expect(counts.thirdparty).toBe(2);
            expect(counts.contact).toBe(1);
        });
    });
});
