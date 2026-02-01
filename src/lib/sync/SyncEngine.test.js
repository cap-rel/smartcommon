import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncEngine } from './SyncEngine';

describe('SyncEngine', () => {
    let engine;
    let mockStorage;
    let mockApi;

    beforeEach(() => {
        mockStorage = {
            getClientUuid: vi.fn().mockResolvedValue('client-uuid-123'),
            setClientUuid: vi.fn().mockResolvedValue(),
            getSyncScope: vi.fn().mockResolvedValue(['thirdparty', 'contact']),
            setSyncScope: vi.fn().mockResolvedValue(),
            getLastSyncTime: vi.fn().mockResolvedValue(null),
            setLastSyncTime: vi.fn().mockResolvedValue(),
            getPendingChanges: vi.fn().mockResolvedValue([]),
            getPendingChangesCount: vi.fn().mockResolvedValue(0),
            addPendingChange: vi.fn().mockResolvedValue({ queue_id: 1 }),
            deletePendingChange: vi.fn().mockResolvedValue(),
            deletePendingChanges: vi.fn().mockResolvedValue(),
            clearPendingChanges: vi.fn().mockResolvedValue(),
            getEntity: vi.fn().mockResolvedValue(null),
            putEntity: vi.fn().mockResolvedValue(),
            deleteEntity: vi.fn().mockResolvedValue(),
            getEntitiesByTable: vi.fn().mockResolvedValue([]),
            getModifiedEntities: vi.fn().mockResolvedValue([]),
            getConflicts: vi.fn().mockResolvedValue([]),
            getConflictsCount: vi.fn().mockResolvedValue(0),
            getConflict: vi.fn().mockResolvedValue(null),
            addConflict: vi.fn().mockResolvedValue(),
            deleteConflict: vi.fn().mockResolvedValue(),
            addTombstone: vi.fn().mockResolvedValue(),
            clearTombstones: vi.fn().mockResolvedValue(),
            getStats: vi.fn().mockResolvedValue({ entities: 0, pending_changes: 0, conflicts: 0, tombstones: 0 }),
            clear: vi.fn().mockResolvedValue()
        };

        mockApi = {
            setClientUuid: vi.fn(),
            register: vi.fn().mockResolvedValue({
                client_uuid: 'new-client-uuid',
                sync_scope: ['thirdparty', 'contact']
            }),
            push: vi.fn().mockResolvedValue({
                results: { success: [], conflicts: [], errors: [] }
            }),
            pull: vi.fn().mockResolvedValue({
                server_time: '2024-01-15T10:00:00Z',
                changes: {}
            }),
            getConflicts: vi.fn().mockResolvedValue({ conflicts: [] }),
            resolveConflict: vi.fn().mockResolvedValue({
                status: 'resolved',
                object: { tms: '2024-01-15T10:00:00Z' }
            })
        };

        engine = new SyncEngine({
            storage: mockStorage,
            api: mockApi,
            scope: ['thirdparty', 'contact']
        });
    });

    describe('generateTempId', () => {
        it('should generate IDs starting with local_', () => {
            const id = engine.generateTempId();
            expect(id).toMatch(/^local_\d+_[a-z0-9]+$/);
        });

        it('should generate unique IDs', () => {
            const id1 = engine.generateTempId();
            const id2 = engine.generateTempId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('isTempId', () => {
        it('should return true for temp IDs', () => {
            expect(engine.isTempId('local_12345_abc')).toBe(true);
        });

        it('should return false for numeric IDs', () => {
            expect(engine.isTempId(123)).toBe(false);
            expect(engine.isTempId('123')).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(engine.isTempId(null)).toBe(false);
            expect(engine.isTempId(undefined)).toBe(false);
        });
    });

    describe('register', () => {
        it('should call API register and store client UUID', async () => {
            const result = await engine.register('device-uuid');

            expect(mockApi.register).toHaveBeenCalledWith('device-uuid', ['thirdparty', 'contact']);
            expect(mockStorage.setClientUuid).toHaveBeenCalledWith('new-client-uuid');
            expect(mockStorage.setSyncScope).toHaveBeenCalledWith(['thirdparty', 'contact']);
            expect(result.client_uuid).toBe('new-client-uuid');
        });
    });

    describe('isRegistered', () => {
        it('should return true when client UUID exists', async () => {
            mockStorage.getClientUuid.mockResolvedValue('uuid');
            expect(await engine.isRegistered()).toBe(true);
        });

        it('should return false when client UUID is null', async () => {
            mockStorage.getClientUuid.mockResolvedValue(null);
            expect(await engine.isRegistered()).toBe(false);
        });
    });

    describe('createLocal', () => {
        it('should create entity with temp ID', async () => {
            const tempId = await engine.createLocal('thirdparty', { name: 'Test Company' });

            expect(tempId).toMatch(/^local_/);
            expect(mockStorage.putEntity).toHaveBeenCalledWith(
                'thirdparty',
                tempId,
                expect.objectContaining({ name: 'Test Company', id: tempId }),
                null,
                expect.any(String)
            );
        });

        it('should add pending change for create', async () => {
            await engine.createLocal('thirdparty', { name: 'Test' });

            expect(mockStorage.addPendingChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    table: 'thirdparty',
                    action: 'create',
                    temp_id: expect.stringMatching(/^local_/),
                    data: { name: 'Test' }
                })
            );
        });
    });

    describe('updateLocal', () => {
        it('should update existing entity', async () => {
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: 123,
                data: { name: 'Old Name', email: 'test@test.com' },
                server_tms: '2024-01-01T00:00:00Z'
            });

            await engine.updateLocal('thirdparty', 123, { name: 'New Name' });

            expect(mockStorage.putEntity).toHaveBeenCalledWith(
                'thirdparty',
                123,
                { name: 'New Name', email: 'test@test.com' },
                '2024-01-01T00:00:00Z',
                expect.any(String)
            );
        });

        it('should add pending change for update', async () => {
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: 123,
                data: { name: 'Old' },
                server_tms: '2024-01-01T00:00:00Z'
            });

            await engine.updateLocal('thirdparty', 123, { name: 'New' });

            expect(mockStorage.addPendingChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    table: 'thirdparty',
                    action: 'update',
                    id: 123,
                    base_tms: '2024-01-01T00:00:00Z',
                    data: { name: 'New' }
                })
            );
        });

        it('should throw if entity not found', async () => {
            mockStorage.getEntity.mockResolvedValue(null);

            await expect(engine.updateLocal('thirdparty', 999, {}))
                .rejects.toThrow('Entity not found: thirdparty/999');
        });
    });

    describe('deleteLocal', () => {
        it('should delete entity and add tombstone', async () => {
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: 123,
                data: { name: 'Test' },
                server_tms: '2024-01-01T00:00:00Z'
            });

            await engine.deleteLocal('thirdparty', 123);

            expect(mockStorage.addTombstone).toHaveBeenCalledWith('thirdparty', 123);
            expect(mockStorage.deleteEntity).toHaveBeenCalledWith('thirdparty', 123);
        });

        it('should add pending change for delete on server entities', async () => {
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: 123,
                data: { name: 'Test' },
                server_tms: '2024-01-01T00:00:00Z'
            });

            await engine.deleteLocal('thirdparty', 123);

            expect(mockStorage.addPendingChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    table: 'thirdparty',
                    action: 'delete',
                    id: 123
                })
            );
        });

        it('should not add pending change for temp entities', async () => {
            const tempId = 'local_12345_abc';
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: tempId,
                data: { name: 'Test' },
                server_tms: null
            });
            mockStorage.getPendingChanges.mockResolvedValue([
                { queue_id: 1, temp_id: tempId, action: 'create' }
            ]);

            await engine.deleteLocal('thirdparty', tempId);

            expect(mockStorage.deletePendingChange).toHaveBeenCalledWith(1);
            expect(mockStorage.addPendingChange).not.toHaveBeenCalledWith(
                expect.objectContaining({ action: 'delete' })
            );
        });

        it('should throw if entity not found', async () => {
            mockStorage.getEntity.mockResolvedValue(null);

            await expect(engine.deleteLocal('thirdparty', 999))
                .rejects.toThrow('Entity not found: thirdparty/999');
        });
    });

    describe('push', () => {
        it('should return empty result when no pending changes', async () => {
            mockStorage.getPendingChanges.mockResolvedValue([]);

            const result = await engine.push();

            expect(result.success).toBe(0);
            expect(mockApi.push).not.toHaveBeenCalled();
        });

        it('should push changes and process success', async () => {
            mockStorage.getPendingChanges.mockResolvedValue([
                { queue_id: 1, table: 'thirdparty', action: 'create', temp_id: 'local_1', data: { name: 'Test' } }
            ]);
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: 'local_1',
                data: { name: 'Test' }
            });
            mockApi.push.mockResolvedValue({
                results: {
                    success: [{ temp_id: 'local_1', server_id: 100, tms: '2024-01-15T10:00:00Z' }],
                    conflicts: [],
                    errors: []
                }
            });

            const result = await engine.push();

            expect(result.success).toBe(1);
            expect(mockStorage.deletePendingChange).toHaveBeenCalledWith(1);
        });

        it('should handle conflicts from push', async () => {
            mockStorage.getPendingChanges.mockResolvedValue([
                { queue_id: 1, table: 'thirdparty', action: 'update', id: 123, data: { name: 'Client' } }
            ]);
            mockApi.push.mockResolvedValue({
                results: {
                    success: [],
                    conflicts: [{
                        conflict_id: 'c1',
                        table: 'thirdparty',
                        id: 123,
                        client_data: { name: 'Client' },
                        server_data: { name: 'Server' }
                    }],
                    errors: []
                }
            });

            const result = await engine.push();

            expect(result.conflicts).toHaveLength(1);
            expect(mockStorage.addConflict).toHaveBeenCalled();
            expect(mockStorage.deletePendingChange).toHaveBeenCalledWith(1);
        });

        it('should chunk large change sets', async () => {
            const manyChanges = Array.from({ length: 75 }, (_, i) => ({
                queue_id: i,
                table: 'thirdparty',
                action: 'create',
                temp_id: `local_${i}`,
                data: {}
            }));
            mockStorage.getPendingChanges.mockResolvedValue(manyChanges);
            mockApi.push.mockResolvedValue({
                results: { success: [], conflicts: [], errors: [] }
            });

            await engine.push();

            expect(mockApi.push).toHaveBeenCalledTimes(2);
        });
    });

    describe('pull', () => {
        it('should pull and store updated entities', async () => {
            mockApi.pull.mockResolvedValue({
                server_time: '2024-01-15T10:00:00Z',
                changes: {
                    thirdparty: {
                        updated: [
                            { id: 1, name: 'Company 1', tms: '2024-01-15T09:00:00Z' },
                            { id: 2, name: 'Company 2', tms: '2024-01-15T09:30:00Z' }
                        ],
                        deleted: []
                    }
                }
            });

            const result = await engine.pull();

            expect(result.updated).toBe(2);
            expect(mockStorage.putEntity).toHaveBeenCalledTimes(2);
            expect(mockStorage.setLastSyncTime).toHaveBeenCalledWith('2024-01-15T10:00:00Z');
        });

        it('should delete entities from server tombstones', async () => {
            mockApi.pull.mockResolvedValue({
                server_time: '2024-01-15T10:00:00Z',
                changes: {
                    thirdparty: {
                        updated: [],
                        deleted: [{ id: 123 }]
                    }
                }
            });

            const result = await engine.pull();

            expect(result.deleted).toBe(1);
            expect(mockStorage.deleteEntity).toHaveBeenCalledWith('thirdparty', 123);
        });

        it('should not overwrite locally modified entities', async () => {
            mockStorage.getEntity.mockResolvedValue({
                table: 'thirdparty',
                id: 1,
                data: { name: 'Local Version' },
                local_updated_at: '2024-01-15T08:00:00Z'
            });
            mockApi.pull.mockResolvedValue({
                server_time: '2024-01-15T10:00:00Z',
                changes: {
                    thirdparty: {
                        updated: [{ id: 1, name: 'Server Version', tms: '2024-01-15T09:00:00Z' }],
                        deleted: []
                    }
                }
            });

            const result = await engine.pull();

            expect(result.updated).toBe(0);
            expect(mockStorage.putEntity).not.toHaveBeenCalled();
        });

        it('should handle pagination with has_more', async () => {
            mockApi.pull
                .mockResolvedValueOnce({
                    server_time: '2024-01-15T10:00:00Z',
                    changes: {
                        thirdparty: {
                            updated: [{ id: 1, name: 'First', tms: '2024-01-15T09:00:00Z' }],
                            has_more: true
                        }
                    }
                })
                .mockResolvedValueOnce({
                    server_time: '2024-01-15T10:00:00Z',
                    changes: {
                        thirdparty: {
                            updated: [{ id: 2, name: 'Second', tms: '2024-01-15T09:00:00Z' }],
                            has_more: false
                        }
                    }
                });

            await engine.pull();

            expect(mockApi.pull).toHaveBeenCalledTimes(2);
        });
    });

    describe('sync', () => {
        it('should push then pull', async () => {
            const pushSpy = vi.spyOn(engine, 'push');
            const pullSpy = vi.spyOn(engine, 'pull');

            await engine.sync();

            expect(pushSpy).toHaveBeenCalled();
            expect(pullSpy).toHaveBeenCalled();
            expect(mockStorage.clearTombstones).toHaveBeenCalled();
        });

        it('should set client UUID on API', async () => {
            await engine.sync();

            expect(mockApi.setClientUuid).toHaveBeenCalledWith('client-uuid-123');
        });
    });

    describe('getConflicts', () => {
        it('should merge local and server conflicts', async () => {
            mockStorage.getConflicts.mockResolvedValue([
                { conflict_id: 'local_1', table: 'a' }
            ]);
            mockApi.getConflicts.mockResolvedValue({
                conflicts: [{ conflict_id: 'server_1', table: 'b' }]
            });

            const conflicts = await engine.getConflicts();

            expect(conflicts).toHaveLength(2);
        });

        it('should return only local conflicts when offline', async () => {
            mockStorage.getConflicts.mockResolvedValue([
                { conflict_id: 'local_1', table: 'a' }
            ]);
            mockApi.getConflicts.mockRejectedValue(new Error('Network error'));

            const conflicts = await engine.getConflicts();

            expect(conflicts).toHaveLength(1);
            expect(conflicts[0].conflict_id).toBe('local_1');
        });
    });

    describe('resolveConflict', () => {
        it('should resolve and update entity', async () => {
            mockStorage.getConflict.mockResolvedValue({
                conflict_id: 'c1',
                table: 'thirdparty',
                object_id: 123,
                client_data: { name: 'Client' },
                server_data: { name: 'Server' }
            });

            await engine.resolveConflict('c1', 'client');

            expect(mockApi.resolveConflict).toHaveBeenCalledWith('c1', 'client', null);
            expect(mockStorage.putEntity).toHaveBeenCalledWith(
                'thirdparty',
                123,
                { name: 'Client' },
                '2024-01-15T10:00:00Z',
                null
            );
            expect(mockStorage.deleteConflict).toHaveBeenCalledWith('c1');
        });

        it('should throw if conflict not found', async () => {
            mockStorage.getConflict.mockResolvedValue(null);

            await expect(engine.resolveConflict('unknown', 'client'))
                .rejects.toThrow('Conflict not found: unknown');
        });
    });

    describe('getStatus', () => {
        it('should return comprehensive status', async () => {
            mockStorage.getClientUuid.mockResolvedValue('uuid');
            mockStorage.getLastSyncTime.mockResolvedValue('2024-01-15T10:00:00Z');
            mockStorage.getPendingChangesCount.mockResolvedValue(5);
            mockStorage.getConflictsCount.mockResolvedValue(2);

            const status = await engine.getStatus();

            expect(status.isRegistered).toBe(true);
            expect(status.clientUuid).toBe('uuid');
            expect(status.lastSyncTime).toBe('2024-01-15T10:00:00Z');
            expect(status.pendingCount).toBe(5);
            expect(status.conflictsCount).toBe(2);
        });
    });

    describe('reset', () => {
        it('should clear all storage', async () => {
            await engine.reset();

            expect(mockStorage.clear).toHaveBeenCalled();
        });
    });

    describe('_chunkArray', () => {
        it('should split array into chunks', () => {
            const arr = [1, 2, 3, 4, 5, 6, 7];
            const chunks = engine._chunkArray(arr, 3);

            expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
        });

        it('should handle empty array', () => {
            expect(engine._chunkArray([], 3)).toEqual([]);
        });

        it('should handle array smaller than chunk size', () => {
            expect(engine._chunkArray([1, 2], 5)).toEqual([[1, 2]]);
        });
    });
});
