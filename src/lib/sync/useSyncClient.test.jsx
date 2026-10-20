import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Create mock instances that we can control
const mockStorageInstance = {
    init: vi.fn().mockResolvedValue(),
    close: vi.fn(),
    getClientUuid: vi.fn().mockResolvedValue(null),
    getPendingChangesCount: vi.fn().mockResolvedValue(0),
    getConflictsCount: vi.fn().mockResolvedValue(0),
    getEntity: vi.fn().mockResolvedValue(null),
    getEntitiesByTable: vi.fn().mockResolvedValue([])
};

const mockApiInstance = {
    setClientUuid: vi.fn()
};

// Arguments each SyncApi/SyncEngine was built with
const constructed = { api: [], engine: [] };

const mockHttp = { name: 'useApi-private' };
const mockUseApi = vi.fn(() => ({ private: mockHttp }));

// Hoisted: useSyncClient creates its logger at import time.
const mockLogger = vi.hoisted(() => ({ warning: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() }));

const mockEngineInstance = {
    getStatus: vi.fn().mockResolvedValue({
        isRegistered: false,
        clientUuid: null,
        lastSyncTime: null,
        pendingCount: 0,
        conflictsCount: 0,
        stats: {}
    }),
    register: vi.fn().mockResolvedValue({ client_uuid: 'new-uuid', sync_scope: ['thirdparty'] }),
    isRegistered: vi.fn().mockResolvedValue(true),
    getServerStatus: vi.fn().mockResolvedValue({ client_uuid: 'new-uuid', pending_conflicts: 0 }),
    sync: vi.fn().mockResolvedValue({ pushed: { success: 0 }, pulled: { updated: 0 }, conflicts: [], errors: [] }),
    push: vi.fn().mockResolvedValue({ success: 0, conflicts: [], errors: [] }),
    pull: vi.fn().mockResolvedValue({ updated: 0, deleted: 0 }),
    createLocal: vi.fn().mockResolvedValue('local_123'),
    updateLocal: vi.fn().mockResolvedValue(),
    deleteLocal: vi.fn().mockResolvedValue(),
    getConflicts: vi.fn().mockResolvedValue([]),
    resolveConflict: vi.fn().mockResolvedValue({ status: 'resolved' }),
    reset: vi.fn().mockResolvedValue()
};

const mockUseOnlineStatus = vi.fn(() => ({
    isOnline: true,
    isServerReachable: true,
    checkNow: vi.fn()
}));

// Mock the dependencies before importing useSyncClient
vi.mock('lib/hooks', () => ({
    useApi: (...args) => mockUseApi(...args)
}));

vi.mock('lib/utils', () => ({
    createLogger: () => mockLogger
}));

vi.mock('../hooks/local/useOnlineStatus', () => ({
    useOnlineStatus: (...args) => mockUseOnlineStatus(...args)
}));

vi.mock('./SyncStorage', () => ({
    SyncStorage: class MockSyncStorage {
        constructor() {
            Object.assign(this, mockStorageInstance);
        }
    }
}));

vi.mock('./SyncApi', () => ({
    SyncApi: class MockSyncApi {
        constructor(options) {
            constructed.api.push(options);
            Object.assign(this, mockApiInstance);
        }
    }
}));

vi.mock('./SyncEngine', () => ({
    SyncEngine: class MockSyncEngine {
        constructor(options) {
            constructed.engine.push(options);
            Object.assign(this, mockEngineInstance);
        }
    }
}));

// Import after mocks
import { useSyncClient } from './useSyncClient';

describe('useSyncClient', () => {
    beforeEach(() => {
        // Reset all mocks
        Object.values(mockStorageInstance).forEach(fn => fn.mockClear?.());
        Object.values(mockApiInstance).forEach(fn => fn.mockClear?.());
        Object.values(mockEngineInstance).forEach(fn => fn.mockClear?.());
        mockUseOnlineStatus.mockClear();
        Object.values(mockLogger).forEach(fn => fn.mockClear());
        constructed.api.length = 0;
        constructed.engine.length = 0;
        mockEngineInstance.isRegistered.mockResolvedValue(true);

        // Reset default implementations
        mockStorageInstance.init.mockResolvedValue();
        mockStorageInstance.getClientUuid.mockResolvedValue(null);
        mockStorageInstance.getPendingChangesCount.mockResolvedValue(0);
        mockStorageInstance.getConflictsCount.mockResolvedValue(0);
        mockStorageInstance.getEntity.mockResolvedValue(null);
        mockStorageInstance.getEntitiesByTable.mockResolvedValue([]);

        mockEngineInstance.getStatus.mockResolvedValue({
            isRegistered: false,
            clientUuid: null,
            lastSyncTime: null,
            pendingCount: 0,
            conflictsCount: 0,
            stats: {}
        });
        mockEngineInstance.sync.mockResolvedValue({ pushed: { success: 0 }, pulled: { updated: 0 }, conflicts: [], errors: [] });
        mockEngineInstance.push.mockResolvedValue({ success: 0, conflicts: [], errors: [] });
        mockEngineInstance.pull.mockResolvedValue({ updated: 0, deleted: 0 });
        mockEngineInstance.createLocal.mockResolvedValue('local_123');
        mockEngineInstance.getConflicts.mockResolvedValue([]);
        mockEngineInstance.resolveConflict.mockResolvedValue({ status: 'resolved' });

        mockUseOnlineStatus.mockReturnValue({
            isOnline: true,
            isServerReachable: true,
            checkNow: vi.fn()
        });
    });

    const defaultOptions = {
        scope: ['thirdparty', 'contact'],
        appVersion: '1.2.3'
    };

    describe('initialization', () => {
        it('should initialize and load status', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            expect(mockStorageInstance.init).toHaveBeenCalled();
            expect(mockEngineInstance.getStatus).toHaveBeenCalled();
        });

        it('should expose online status from useOnlineStatus', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            expect(result.current.isOnline).toBe(true);
            expect(result.current.isServerReachable).toBe(true);
        });

        it('sends requests through the useApi private instance', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            expect(constructed.api).toHaveLength(1);
            expect(constructed.api[0].getHttp()).toBe(mockHttp);
            expect(constructed.engine[0]).toMatchObject({
                scope: ['thirdparty', 'contact'],
                appVersion: '1.2.3'
            });
        });

        it('does not probe sync/status by default', async () => {
            renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(mockUseOnlineStatus).toHaveBeenCalled();
            });
            expect(mockUseOnlineStatus.mock.calls[0][0].healthCheckUrl).toBeNull();
        });

        it('forwards a custom healthCheckUrl', async () => {
            renderHook(() => useSyncClient({ ...defaultOptions, healthCheckUrl: '/health' }));

            await waitFor(() => {
                expect(mockUseOnlineStatus).toHaveBeenCalled();
            });
            expect(mockUseOnlineStatus.mock.calls[0][0].healthCheckUrl).toBe('/health');
        });

        it('warns once that apiUrl and getAccessToken are ignored', async () => {
            const { result, rerender } = renderHook(
                (props) => useSyncClient(props),
                { initialProps: { ...defaultOptions, apiUrl: '/api/smartauth', getAccessToken: () => 't' } }
            );

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });
            rerender({ ...defaultOptions, apiUrl: '/api/other', getAccessToken: () => 'u' });

            expect(mockLogger.warning).toHaveBeenCalledTimes(1);
            expect(mockLogger.warning.mock.calls[0][0]).toContain('ignored');
        });

        it('does not warn without legacy options', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });
            expect(mockLogger.warning).not.toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should call engine.register and update state', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.register();
            });

            expect(mockEngineInstance.register).toHaveBeenCalledWith();
            expect(result.current.isRegistered).toBe(true);
        });
    });

    describe('sync', () => {
        it('should call engine.sync', async () => {
            mockEngineInstance.sync.mockResolvedValue({
                pushed: { success: 5 },
                pulled: { updated: 10 },
                conflicts: [],
                errors: []
            });

            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            let syncResult;
            await act(async () => {
                syncResult = await result.current.sync();
            });

            expect(mockEngineInstance.sync).toHaveBeenCalled();
            expect(syncResult.pushed.success).toBe(5);
        });

        it('should call onSyncStart and onSyncComplete callbacks', async () => {
            const onSyncStart = vi.fn();
            const onSyncComplete = vi.fn();

            const { result } = renderHook(() => useSyncClient({
                ...defaultOptions,
                onSyncStart,
                onSyncComplete
            }));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.sync();
            });

            expect(onSyncStart).toHaveBeenCalled();
            expect(onSyncComplete).toHaveBeenCalled();
        });

        it('should call onConflict when conflicts detected', async () => {
            const onConflict = vi.fn();
            mockEngineInstance.sync.mockResolvedValue({
                pushed: {},
                pulled: {},
                conflicts: [{ conflict_id: 'c1' }],
                errors: []
            });

            const { result } = renderHook(() => useSyncClient({
                ...defaultOptions,
                onConflict
            }));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.sync();
            });

            expect(onConflict).toHaveBeenCalledWith([{ conflict_id: 'c1' }]);
        });

        it('should handle sync error', async () => {
            const onSyncError = vi.fn();
            mockEngineInstance.sync.mockRejectedValue(new Error('Sync failed'));

            const { result } = renderHook(() => useSyncClient({
                ...defaultOptions,
                onSyncError
            }));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                try {
                    await result.current.sync();
                } catch (e) {
                    // Expected
                }
            });

            expect(onSyncError).toHaveBeenCalled();
            expect(result.current.syncError).toBeTruthy();
        });
    });

    describe('push and pull', () => {
        it('should call engine.push', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.push();
            });

            expect(mockEngineInstance.push).toHaveBeenCalled();
        });

        it('should call engine.pull', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.pull();
            });

            expect(mockEngineInstance.pull).toHaveBeenCalled();
        });
    });

    describe('local operations', () => {
        it('should create entity locally', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            let tempId;
            await act(async () => {
                tempId = await result.current.create('thirdparty', { name: 'Test' });
            });

            expect(mockEngineInstance.createLocal).toHaveBeenCalledWith('thirdparty', { name: 'Test' });
            expect(tempId).toBe('local_123');
        });

        it('should update entity locally', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.update('thirdparty', 123, { name: 'Updated' });
            });

            expect(mockEngineInstance.updateLocal).toHaveBeenCalledWith('thirdparty', 123, { name: 'Updated' });
        });

        it('should remove entity locally', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.remove('thirdparty', 123);
            });

            expect(mockEngineInstance.deleteLocal).toHaveBeenCalledWith('thirdparty', 123);
        });
    });

    describe('cleanup', () => {
        it('should close storage on unmount', async () => {
            const { unmount } = renderHook(() => useSyncClient(defaultOptions));

            await waitFor(() => {
                expect(mockStorageInstance.init).toHaveBeenCalled();
            });

            unmount();

            expect(mockStorageInstance.close).toHaveBeenCalled();
        });
    });

    describe('server reachability', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('runs the periodic sync when no probe is configured (reachability null)', async () => {
            mockUseOnlineStatus.mockReturnValue({ isOnline: true, isServerReachable: null, checkNow: vi.fn() });
            vi.useFakeTimers({ shouldAdvanceTime: true });

            const { result } = renderHook(() => useSyncClient({ ...defaultOptions, syncInterval: 1000 }));
            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1100);
            });

            expect(mockEngineInstance.sync).toHaveBeenCalled();
        });

        it('holds the periodic sync when the probe failed', async () => {
            mockUseOnlineStatus.mockReturnValue({ isOnline: true, isServerReachable: false, checkNow: vi.fn() });
            vi.useFakeTimers({ shouldAdvanceTime: true });

            const { result } = renderHook(() => useSyncClient({ ...defaultOptions, syncInterval: 1000 }));
            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1100);
            });

            expect(mockEngineInstance.sync).not.toHaveBeenCalled();
        });
    });

    describe('push conflicts and server status', () => {
        it('calls onConflict when a push reports conflicts', async () => {
            const onConflict = vi.fn();
            const conflict = { conflict_id: 'local:thirdparty:1', table: 'thirdparty', object_id: 1 };
            mockEngineInstance.push.mockResolvedValue({ success: 0, conflicts: [conflict], errors: [] });

            const { result } = renderHook(() => useSyncClient({ ...defaultOptions, onConflict }));
            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            await act(async () => {
                await result.current.push();
            });

            expect(onConflict).toHaveBeenCalledWith([conflict]);
            expect(result.current.isRegistered).toBe(true);
        });

        it('exposes the server status', async () => {
            const { result } = renderHook(() => useSyncClient(defaultOptions));
            await waitFor(() => {
                expect(result.current.isInitialized).toBe(true);
            });

            let status;
            await act(async () => {
                status = await result.current.getServerStatus();
            });

            expect(status).toEqual({ client_uuid: 'new-uuid', pending_conflicts: 0 });
        });
    });
});
