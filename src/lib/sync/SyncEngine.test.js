import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('lib/utils', () => ({
    createLogger: () => ({ warning: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })
}));

import { SyncEngine } from './SyncEngine';
import { ForbiddenSyncError } from './errors';

/** In-memory stand-in for SyncStorage (same method contract). */
class MemoryStorage {
    constructor() {
        this.entities = new Map();
        this.pending = [];
        this.conflicts = new Map();
        this.meta = new Map();
        this.tombstones = [];
        this.nextQueueId = 1;
    }
    key(table, id) { return `${table}|${id}`; }
    async getClientUuid() { return this.meta.get('client_uuid') ?? null; }
    async setClientUuid(uuid) { this.meta.set('client_uuid', uuid); }
    async setSyncScope(scope) { this.meta.set('sync_scope', scope); }
    async getMeta(key) { return this.meta.get(key) ?? null; }
    async setMeta(key, value) { this.meta.set(key, value); }
    async getLastSyncTime() { return this.meta.get('last_sync_time') ?? null; }
    async setLastSyncTime(value) { this.meta.set('last_sync_time', value); }
    async getEntity(table, id) { return this.entities.get(this.key(table, id)) ?? null; }
    async putEntity(table, id, data, server_tms, local_updated_at = null) {
        this.entities.set(this.key(table, id), { table, id, data, server_tms, local_updated_at });
    }
    async deleteEntity(table, id) { this.entities.delete(this.key(table, id)); }
    async getEntitiesByTable(table) { return [...this.entities.values()].filter(e => e.table === table); }
    async addPendingChange(change) {
        const record = { ...change, queue_id: this.nextQueueId++, created_at: new Date().toISOString() };
        this.pending.push(record);
        return record;
    }
    async getPendingChanges() { return [...this.pending]; }
    async getPendingChangesCount() { return this.pending.length; }
    async deletePendingChange(queueId) { this.pending = this.pending.filter(c => c.queue_id !== queueId); }
    async deletePendingChanges(queueIds) { this.pending = this.pending.filter(c => !queueIds.includes(c.queue_id)); }
    async addConflict(conflict) { this.conflicts.set(conflict.conflict_id, { ...conflict }); }
    async getConflicts() { return [...this.conflicts.values()]; }
    async getConflictsCount() { return this.conflicts.size; }
    async getConflict(id) { return this.conflicts.get(id) ?? null; }
    async deleteConflict(id) { this.conflicts.delete(id); }
    async addTombstone(table, id) { this.tombstones.push({ table, id }); }
    async clearTombstones() { this.tombstones = []; }
    async getStats() { return { entities: this.entities.size }; }
    async clear() {
        this.entities.clear(); this.pending = []; this.conflicts.clear(); this.meta.clear(); this.tombstones = [];
    }
}

const httpError = (status, error) => Object.assign(new Error(`sync: ${error}`), { status, data: { error } });

/** Fake SyncApi: responses are scripted per test. */
const createApi = () => ({
    clientUuid: null,
    setClientUuid: vi.fn(function (uuid) { this.clientUuid = uuid; }),
    register: vi.fn(async function (uuid) {
        this.clientUuid = uuid;
        return { client_id: 1, client_uuid: uuid, sync_scope: { thirdparty: true, contact: true } };
    }),
    pull: vi.fn(async () => ({ updated: [], deleted: [], has_more: false, server_time: '2025-01-10T10:00:00+00:00' })),
    push: vi.fn(async () => ({ success: [], conflicts: [], errors: [], id_mapping: [], server_time: 'now' })),
    getConflicts: vi.fn(async () => ({ conflicts: [] })),
    resolveConflict: vi.fn(async () => ({ success: true, message: 'Conflict resolved successfully' })),
    getStatus: vi.fn(async () => ({ pending_conflicts: 0 }))
});

describe('SyncEngine', () => {
    let storage;
    let api;
    let engine;

    beforeEach(async () => {
        storage = new MemoryStorage();
        api = createApi();
        engine = new SyncEngine({ storage, api, scope: ['thirdparty', 'contact'], appVersion: '1.2.3' });
    });

    const registered = async () => storage.setClientUuid('11111111-2222-4333-8444-555555555555');

    describe('registration', () => {
        it('generates a UUID, registers the scope and stores the client', async () => {
            const result = await engine.register();

            const [uuid, scope, appVersion] = api.register.mock.calls[0];
            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(scope).toEqual(['thirdparty', 'contact']);
            expect(appVersion).toBe('1.2.3');
            expect(await storage.getClientUuid()).toBe(uuid);
            expect(result.client_uuid).toBe(uuid);
        });

        it('reuses the stored client_uuid when registering again', async () => {
            await registered();
            await engine.register();
            expect(api.register.mock.calls[0][0]).toBe('11111111-2222-4333-8444-555555555555');
        });

        it('does not store a client the server refused', async () => {
            api.register.mockRejectedValueOnce(httpError(400, 'Device ID not found in token'));
            await expect(engine.register()).rejects.toThrow(/Device ID/);
            expect(await storage.getClientUuid()).toBeNull();
        });

        it('sync registers on first use', async () => {
            await engine.sync();
            expect(api.register).toHaveBeenCalledTimes(1);
            expect(api.pull).toHaveBeenCalled();
        });

        it('registers again and retries when the server forgot the client', async () => {
            await registered();
            api.pull
                .mockRejectedValueOnce(httpError(404, 'Client not registered'))
                .mockResolvedValue({ updated: [], deleted: [], has_more: false, server_time: 't' });

            const result = await engine.pull();

            expect(api.register).toHaveBeenCalledTimes(1);
            expect(result.errors).toEqual([]);
        });
    });

    describe('pull', () => {
        beforeEach(registered);

        it('pulls each type separately, a full pull the first time', async () => {
            await engine.pull();

            expect(api.pull).toHaveBeenCalledTimes(2);
            expect(api.pull.mock.calls[0][0]).toBe('thirdparty');
            expect(api.pull.mock.calls[1][0]).toBe('contact');
            expect(api.pull.mock.calls[0][1].lastSyncAt).toBe('1970-01-01T00:00:00+00:00');
        });

        it('follows next_cursor with a fixed last_sync_at and stores the watermark per type', async () => {
            await storage.setMeta('last_sync_at:thirdparty', '2025-01-01T00:00:00+00:00');
            api.pull.mockImplementation(async (type, { cursor }) => {
                if (type === 'thirdparty' && !cursor) {
                    return { updated: [{ id: 1, name: 'A', tms: 't1' }], deleted: [], has_more: true, next_cursor: 'c1', server_time: 's1' };
                }
                if (type === 'thirdparty') {
                    return { updated: [{ id: 2, name: 'B', tms: 't2' }], deleted: [], has_more: false, server_time: 's2' };
                }
                return { updated: [], deleted: [], has_more: false, server_time: 's3' };
            });

            const result = await engine.pull();

            const thirdpartyCalls = api.pull.mock.calls.filter(c => c[0] === 'thirdparty');
            expect(thirdpartyCalls.map(c => c[1])).toEqual([
                { lastSyncAt: '2025-01-01T00:00:00+00:00', limit: 500, cursor: null },
                { lastSyncAt: '2025-01-01T00:00:00+00:00', limit: 500, cursor: 'c1' }
            ]);
            expect(result.updated).toBe(2);
            expect(await storage.getMeta('last_sync_at:thirdparty')).toBe('s2');
            expect(await storage.getMeta('last_sync_at:contact')).toBe('s3');
            expect(await storage.getLastSyncTime()).toBe('s3');
            expect((await storage.getEntity('thirdparty', 2)).server_tms).toBe('t2');
        });

        it('keeps local modifications and applies deletions', async () => {
            await storage.putEntity('thirdparty', 1, { id: 1, name: 'mine' }, 't0', 'local-time');
            await storage.putEntity('thirdparty', 5, { id: 5 }, 't0', null);
            api.pull.mockImplementation(async (type) => (type === 'thirdparty'
                ? { updated: [{ id: 1, name: 'theirs', tms: 't1' }], deleted: [{ id: 5, deleted_at: 'd' }], has_more: false, server_time: 's' }
                : { updated: [], deleted: [], has_more: false, server_time: 's' }));

            await engine.pull();

            expect((await storage.getEntity('thirdparty', 1)).data.name).toBe('mine');
            expect(await storage.getEntity('thirdparty', 5)).toBeNull();
        });

        it('reports a failing type, keeps its watermark and goes on with the others', async () => {
            await storage.setMeta('last_sync_at:thirdparty', 'old');
            api.pull.mockImplementation(async (type) => {
                if (type === 'thirdparty') throw httpError(500, 'Database error during pull');
                return { updated: [{ id: 9, tms: 't' }], deleted: [], has_more: false, server_time: 's' };
            });

            const result = await engine.pull();

            expect(result.errors).toEqual([expect.objectContaining({ table: 'thirdparty', error: 'PULL_FAILED', status: 500 })]);
            expect(await storage.getMeta('last_sync_at:thirdparty')).toBe('old');
            expect(await storage.getEntity('contact', 9)).not.toBeNull();
            expect(await storage.getLastSyncTime()).toBeNull();
        });

        it('treats has_more without next_cursor as a failure instead of looping', async () => {
            api.pull.mockResolvedValue({ updated: [], deleted: [], has_more: true, server_time: 's' });

            const result = await engine.pull();

            expect(api.pull).toHaveBeenCalledTimes(2);
            expect(result.errors).toHaveLength(2);
        });

        it('stops everything on 403', async () => {
            api.pull.mockRejectedValue(httpError(403, 'Permission denied'));
            await expect(engine.pull()).rejects.toBeInstanceOf(ForbiddenSyncError);
            expect(api.pull).toHaveBeenCalledTimes(1);
        });
    });

    describe('push', () => {
        beforeEach(registered);

        it('pushes one object type per request with the server change shape', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3, name: 'A' }, 't3');
            await engine.updateLocal('thirdparty', 3, { name: 'B' });
            api.push.mockResolvedValue({ success: [3], conflicts: [], errors: [], id_mapping: [] });

            const result = await engine.push();

            expect(api.push).toHaveBeenCalledWith('thirdparty', [
                { action: 'update', id: 3, base_tms: 't3', data: { name: 'B' } }
            ]);
            expect(result.success).toBe(1);
            expect(storage.pending).toHaveLength(0);
            expect((await storage.getEntity('thirdparty', 3)).local_updated_at).toBeNull();
        });

        it('re-keys a created entity and remaps a child created in the same push', async () => {
            const parentTemp = await engine.createLocal('thirdparty', { name: 'New Co' });
            const childTemp = await engine.createLocal('contact', { lastname: 'Doe', socid: parentTemp });
            api.push.mockImplementation(async (type, changes) => (type === 'thirdparty'
                ? { success: [42], conflicts: [], errors: [], id_mapping: { [parentTemp]: 42 } }
                : { success: [77], conflicts: [], errors: [], id_mapping: { [changes[0].temp_id]: 77 } }));

            const result = await engine.push();

            expect(api.push.mock.calls[0]).toEqual(['thirdparty', [
                { action: 'create', id: 0, temp_id: parentTemp, base_tms: null, data: { name: 'New Co' } }
            ]]);
            expect(api.push.mock.calls[1][1][0].data.socid).toBe(42);
            expect(result.id_mappings).toEqual({ [parentTemp]: 42, [childTemp]: 77 });
            expect(await storage.getEntity('thirdparty', parentTemp)).toBeNull();
            expect((await storage.getEntity('thirdparty', 42)).data).toMatchObject({ id: 42, name: 'New Co' });
            expect((await storage.getEntity('contact', 77)).data.socid).toBe(42);
            expect(storage.pending).toHaveLength(0);
        });

        it('folds a create and its later updates into a single create', async () => {
            const temp = await engine.createLocal('thirdparty', { name: 'A' });
            await engine.updateLocal('thirdparty', temp, { phone: '01' });
            api.push.mockResolvedValue({ success: [5], conflicts: [], errors: [], id_mapping: { [temp]: 5 } });

            await engine.push();

            expect(api.push).toHaveBeenCalledTimes(1);
            expect(api.push.mock.calls[0][1]).toEqual([
                { action: 'create', id: 0, temp_id: temp, base_tms: null, data: { name: 'A', phone: '01' } }
            ]);
            expect(storage.pending).toHaveLength(0);
        });

        it('folds successive updates, keeping the oldest base_tms', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3 }, 't3');
            await engine.updateLocal('thirdparty', 3, { name: 'B' });
            await storage.putEntity('thirdparty', 3, { id: 3, name: 'B' }, 't-later', 'x');
            await engine.updateLocal('thirdparty', 3, { phone: '02' });
            api.push.mockResolvedValue({ success: [3], conflicts: [], errors: [], id_mapping: [] });

            await engine.push();

            expect(api.push.mock.calls[0][1]).toEqual([
                { action: 'update', id: 3, base_tms: 't3', data: { name: 'B', phone: '02' } }
            ]);
        });

        it('creates parents first and deletes children first', async () => {
            await storage.putEntity('thirdparty', 1, { id: 1 }, 't');
            await storage.putEntity('contact', 2, { id: 2 }, 't');
            await engine.deleteLocal('thirdparty', 1);
            await engine.deleteLocal('contact', 2);
            await engine.createLocal('contact', { lastname: 'X' });
            await engine.createLocal('thirdparty', { name: 'Y' });
            api.push.mockImplementation(async (type, changes) => ({
                success: [], conflicts: [], errors: [],
                id_mapping: Object.fromEntries(changes.filter(c => c.temp_id).map((c, i) => [c.temp_id, 100 + i]))
            }));

            await engine.push();

            expect(api.push.mock.calls.map(([type, changes]) => `${changes[0].action}:${type}`)).toEqual([
                'create:thirdparty', 'create:contact', 'delete:contact', 'delete:thirdparty'
            ]);
        });

        it('records a conflict with a local id and leaves the entity untouched', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3, name: 'A' }, 't3');
            await engine.updateLocal('thirdparty', 3, { name: 'B' });
            api.push.mockResolvedValue({
                success: [], errors: [], id_mapping: [],
                conflicts: [{ object_id: 3, client_tms: 't3', server_tms: 't4', field_conflicts: { name: { client: 'B', server: 'C' } } }]
            });

            const result = await engine.push();

            expect(result.conflicts[0]).toMatchObject({
                conflict_id: 'local:thirdparty:3', table: 'thirdparty', object_id: 3,
                action: 'update', client_data: { name: 'B' }, field_conflicts: ['name']
            });
            expect(storage.pending).toHaveLength(0);
            expect((await storage.getEntity('thirdparty', 3)).local_updated_at).not.toBeNull();
        });

        it('drops a change whose object no longer exists server-side', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3 }, 't3');
            await engine.updateLocal('thirdparty', 3, { name: 'B' });
            api.push.mockResolvedValue({ success: [], conflicts: [], id_mapping: [], errors: [{ id: 3, error: 'Object not found' }] });

            const result = await engine.push();

            expect(result.errors).toEqual([{ table: 'thirdparty', id: 3, error: 'Object not found' }]);
            expect(storage.pending).toHaveLength(0);
            expect(await storage.getEntity('thirdparty', 3)).toBeNull();
        });

        it('keeps changes refused for another reason', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3 }, 't3');
            await engine.updateLocal('thirdparty', 3, { name: 'B' });
            api.push.mockResolvedValue({ success: [], conflicts: [], id_mapping: [], errors: [{ id: 3, error: 'Permission denied' }] });

            await engine.push();

            expect(storage.pending).toHaveLength(1);
        });

        it('keeps everything pending when the request fails', async () => {
            await engine.createLocal('thirdparty', { name: 'A' });
            api.push.mockRejectedValue(Object.assign(new Error('sync/push: network error'), { status: 0 }));

            const result = await engine.push();

            expect(result.errors).toEqual([expect.objectContaining({ table: 'thirdparty', error: 'PUSH_FAILED', status: 0 })]);
            expect(storage.pending).toHaveLength(1);
        });

        it('holds a child back when its parent create failed', async () => {
            const parentTemp = await engine.createLocal('thirdparty', { name: 'A' });
            await engine.createLocal('contact', { lastname: 'Doe', socid: parentTemp });
            api.push.mockResolvedValue({ success: [], conflicts: [], id_mapping: [], errors: [{ temp_id: parentTemp, error: 'Invalid data' }] });

            const result = await engine.push();

            expect(api.push).toHaveBeenCalledTimes(1);
            expect(result.errors.map(e => e.error)).toEqual(['Invalid data', 'WAITING_FOR_PARENT']);
            expect(storage.pending).toHaveLength(2);
        });

        it('drops updates of a temp entity deleted before any push', async () => {
            await storage.addPendingChange({ table: 'thirdparty', action: 'update', id: 'local_1_abc', data: { name: 'x' } });

            await engine.push();

            expect(api.push).not.toHaveBeenCalled();
            expect(storage.pending).toHaveLength(0);
        });

        it('stops everything on 403', async () => {
            await engine.createLocal('thirdparty', { name: 'A' });
            api.push.mockRejectedValue(httpError(403, 'Forbidden'));
            await expect(engine.push()).rejects.toBeInstanceOf(ForbiddenSyncError);
        });
    });

    describe('conflicts', () => {
        beforeEach(registered);

        const serverConflict = {
            id: 31, table_name: 'societe', object_id: 3,
            client_data: { name: 'B' }, server_data: { nom: 'C' },
            client_tms: 't3', server_tms: '2025-01-10T10:00:00+00:00',
            field_conflicts: { name: {} }, date_creation: 'd'
        };

        it('merges the server list with the local records and adopts the server id', async () => {
            await storage.addConflict({ conflict_id: 'local:thirdparty:3', table: 'thirdparty', object_id: 3, action: 'update', created_at: 'c' });
            api.getConflicts.mockResolvedValue({ conflicts: [serverConflict] });

            const conflicts = await engine.getConflicts();

            expect(conflicts).toEqual([expect.objectContaining({
                conflict_id: 31, table: 'thirdparty', table_name: 'societe', object_id: 3,
                field_conflicts: ['name'], client_data: { name: 'B' }, server_data: { nom: 'C' }
            })]);
            expect(await storage.getConflict('local:thirdparty:3')).toBeNull();
            expect(await storage.getConflict(31)).not.toBeNull();
        });

        it('keeps local-only conflicts and returns local records offline', async () => {
            await storage.addConflict({ conflict_id: 'local:contact:8', table: 'contact', object_id: 8, action: 'delete', created_at: 'c' });

            expect(await engine.getConflicts()).toHaveLength(1);

            api.getConflicts.mockRejectedValue(Object.assign(new Error('offline'), { status: 0 }));
            expect(await engine.getConflicts()).toHaveLength(1);
        });

        it('drops a conflict resolved elsewhere and releases the entity', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3 }, 't3', 'local');
            await storage.addConflict({ conflict_id: 31, table: 'thirdparty', object_id: 3, action: 'update', server_tms: '2025-01-10T10:00:00+00:00' });

            const conflicts = await engine.getConflicts();

            expect(conflicts).toEqual([]);
            expect((await storage.getEntity('thirdparty', 3)).local_updated_at).toBeNull();
            expect(await storage.getMeta('last_sync_at:thirdparty')).toBe('2025-01-10T09:59:59+00:00');
        });

        it('resolves a server conflict through the API and updates the entity', async () => {
            await storage.putEntity('thirdparty', 3, { id: 3, name: 'A' }, 't3', 'local');
            await storage.addConflict({ conflict_id: 31, table: 'thirdparty', object_id: 3, action: 'update', client_data: { name: 'B' } });

            const result = await engine.resolveConflict(31, 'client');

            expect(api.resolveConflict).toHaveBeenCalledWith(31, 'client', null);
            expect(result.success).toBe(true);
            expect(await storage.getEntity('thirdparty', 3)).toMatchObject({ data: { id: 3, name: 'B' }, local_updated_at: null });
            expect(await storage.getConflict(31)).toBeNull();
        });

        it('looks up the server id of an update conflict still under its local id', async () => {
            await storage.addConflict({ conflict_id: 'local:thirdparty:3', table: 'thirdparty', object_id: 3, action: 'update', created_at: 'c' });
            api.getConflicts.mockResolvedValue({ conflicts: [serverConflict] });

            await engine.resolveConflict('local:thirdparty:3', 'merged', { name: 'D' });

            expect(api.resolveConflict).toHaveBeenCalledWith(31, 'merged', { name: 'D' });
        });

        it('re-queues a local delete conflict won by the client, against the server tms', async () => {
            await storage.addConflict({ conflict_id: 'local:contact:8', table: 'contact', object_id: 8, action: 'delete', server_tms: 's8' });

            const result = await engine.resolveConflict('local:contact:8', 'client');

            expect(result).toEqual({ success: true, local: true });
            expect(api.resolveConflict).not.toHaveBeenCalled();
            expect(storage.pending).toEqual([expect.objectContaining({ table: 'contact', action: 'delete', id: 8, base_tms: 's8' })]);
        });

        it('pulls the row again when the server wins a local delete conflict', async () => {
            await storage.setMeta('last_sync_at:contact', '2025-02-01T00:00:00+00:00');
            await storage.addConflict({ conflict_id: 'local:contact:8', table: 'contact', object_id: 8, action: 'delete', server_tms: '2025-01-10T10:00:00+00:00' });

            await engine.resolveConflict('local:contact:8', 'server');

            expect(await storage.getMeta('last_sync_at:contact')).toBe('2025-01-10T09:59:59+00:00');
            expect(storage.pending).toHaveLength(0);
        });

        it('refuses to merge a delete conflict and validates the resolution', async () => {
            await storage.addConflict({ conflict_id: 'local:contact:8', table: 'contact', object_id: 8, action: 'delete' });

            await expect(engine.resolveConflict('local:contact:8', 'merged', { a: 1 })).rejects.toThrow(/cannot be merged/);
            await expect(engine.resolveConflict('local:contact:8', 'merged')).rejects.toThrow(/Merged data/);
            await expect(engine.resolveConflict('local:contact:8', 'nope')).rejects.toThrow(/Invalid resolution/);
            expect(await storage.getConflict('local:contact:8')).not.toBeNull();
        });
    });

    describe('local operations', () => {
        it('creates with a local_ temp id and queues the create', async () => {
            const tempId = await engine.createLocal('thirdparty', { name: 'A' });

            expect(engine.isTempId(tempId)).toBe(true);
            expect(storage.pending).toEqual([expect.objectContaining({ action: 'create', temp_id: tempId, data: { name: 'A' } })]);
        });

        it('removes the queued create when a temp entity is deleted', async () => {
            const tempId = await engine.createLocal('thirdparty', { name: 'A' });
            await engine.deleteLocal('thirdparty', tempId);

            expect(storage.pending).toHaveLength(0);
            expect(await storage.getEntity('thirdparty', tempId)).toBeNull();
        });

        it('throws when updating an unknown entity', async () => {
            await expect(engine.updateLocal('thirdparty', 99, {})).rejects.toThrow(/Entity not found/);
        });
    });

    describe('status', () => {
        it('reports local state and the server status', async () => {
            await registered();
            const status = await engine.getStatus();
            expect(status).toMatchObject({ isRegistered: true, pendingCount: 0, conflictsCount: 0 });

            expect(await engine.getServerStatus()).toEqual({ pending_conflicts: 0 });
        });
    });
});
