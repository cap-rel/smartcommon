import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncApi } from './SyncApi';

describe('SyncApi', () => {
    let api;
    let mockFetch;

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        global.navigator = { userAgent: 'test-agent' };

        api = new SyncApi({
            baseUrl: '/api/smartauth',
            getAccessToken: () => 'test-token'
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with correct defaults', () => {
            expect(api.baseUrl).toBe('/api/smartauth');
            expect(api.maxRetries).toBe(3);
            expect(api.baseDelay).toBe(1000);
        });

        it('should strip trailing slash from baseUrl', () => {
            const api2 = new SyncApi({
                baseUrl: '/api/smartauth/',
                getAccessToken: () => 'token'
            });
            expect(api2.baseUrl).toBe('/api/smartauth');
        });
    });

    describe('setClientUuid', () => {
        it('should set client UUID for headers', () => {
            api.setClientUuid('uuid-123');
            expect(api.clientUuid).toBe('uuid-123');
        });
    });

    describe('_buildHeaders', () => {
        it('should include Authorization header when token is available', async () => {
            const headers = await api._buildHeaders();

            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['Accept']).toBe('application/json');
            expect(headers['Authorization']).toBe('Bearer test-token');
        });

        it('should include X-Sync-Client-UUID when set', async () => {
            api.setClientUuid('uuid-456');
            const headers = await api._buildHeaders();

            expect(headers['X-Sync-Client-UUID']).toBe('uuid-456');
        });

        it('should not include Authorization when no token', async () => {
            const api2 = new SyncApi({
                baseUrl: '/api',
                getAccessToken: () => null
            });

            const headers = await api2._buildHeaders();
            expect(headers['Authorization']).toBeUndefined();
        });
    });

    describe('_calculateDelay', () => {
        it('should calculate exponential backoff', () => {
            expect(api._calculateDelay(0)).toBe(1000);
            expect(api._calculateDelay(1)).toBe(2000);
            expect(api._calculateDelay(2)).toBe(4000);
            expect(api._calculateDelay(3)).toBe(8000);
        });

        it('should cap at maxDelay', () => {
            expect(api._calculateDelay(10)).toBe(30000);
        });
    });

    describe('_isRetryable', () => {
        it('should return true for status 0 (network error)', () => {
            expect(api._isRetryable(0)).toBe(true);
        });

        it('should return true for 5xx status', () => {
            expect(api._isRetryable(500)).toBe(true);
            expect(api._isRetryable(502)).toBe(true);
            expect(api._isRetryable(503)).toBe(true);
        });

        it('should return false for 4xx status', () => {
            expect(api._isRetryable(400)).toBe(false);
            expect(api._isRetryable(401)).toBe(false);
            expect(api._isRetryable(404)).toBe(false);
        });

        it('should return false for 2xx status', () => {
            expect(api._isRetryable(200)).toBe(false);
            expect(api._isRetryable(201)).toBe(false);
        });
    });

    describe('register', () => {
        it('should call POST /sync/register with correct data', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    client_uuid: 'new-client-uuid',
                    sync_scope: ['thirdparty', 'contact']
                })
            });

            const result = await api.register('device-uuid', ['thirdparty', 'contact']);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/smartauth/sync/register',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        device_uuid: 'device-uuid',
                        platform: 'PWA',
                        user_agent: 'test-agent',
                        requested_scope: ['thirdparty', 'contact']
                    })
                })
            );

            expect(result.client_uuid).toBe('new-client-uuid');
            expect(api.clientUuid).toBe('new-client-uuid');
        });
    });

    describe('pull', () => {
        it('should call GET /sync/pull with correct params', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    server_time: '2024-01-15T10:00:00Z',
                    changes: {}
                })
            });

            await api.pull(['thirdparty', 'contact'], '2024-01-01T00:00:00Z');

            const calledUrl = mockFetch.mock.calls[0][0];
            expect(calledUrl).toContain('/sync/pull');
            expect(calledUrl).toContain('tables=thirdparty%2Ccontact');
            expect(calledUrl).toContain('since=2024-01-01T00%3A00%3A00Z');
        });

        it('should handle single table as string', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ changes: {} })
            });

            await api.pull('thirdparty');

            const calledUrl = mockFetch.mock.calls[0][0];
            expect(calledUrl).toContain('tables=thirdparty');
        });
    });

    describe('push', () => {
        it('should call POST /sync/push with changes', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    results: { success: [], conflicts: [], errors: [] }
                })
            });

            const changes = [
                { table: 'thirdparty', action: 'create', temp_id: 'local_1', data: { name: 'Test' } }
            ];

            await api.push(changes);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/smartauth/sync/push',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ changes })
                })
            );
        });
    });

    describe('getConflicts', () => {
        it('should call GET /sync/conflicts', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ conflicts: [], total: 0 })
            });

            const result = await api.getConflicts();

            const calledUrl = mockFetch.mock.calls[0][0];
            expect(calledUrl).toContain('/sync/conflicts');
            expect(result.conflicts).toEqual([]);
        });
    });

    describe('resolveConflict', () => {
        it('should call POST /sync/conflicts/{id}/resolve with resolution', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ status: 'resolved' })
            });

            await api.resolveConflict(123, 'client');

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/smartauth/sync/conflicts/123/resolve',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ resolution: 'client' })
                })
            );
        });

        it('should include data for merged resolution', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ status: 'resolved' })
            });

            const mergedData = { name: 'Merged Name' };
            await api.resolveConflict(123, 'merged', mergedData);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/smartauth/sync/conflicts/123/resolve',
                expect.objectContaining({
                    body: JSON.stringify({ resolution: 'merged', data: mergedData })
                })
            );
        });
    });

    describe('getStatus', () => {
        it('should call GET /sync/status', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    client_uuid: 'uuid',
                    last_sync_at: '2024-01-15T10:00:00Z'
                })
            });

            const result = await api.getStatus();

            const calledUrl = mockFetch.mock.calls[0][0];
            expect(calledUrl).toContain('/sync/status');
            expect(result.client_uuid).toBe('uuid');
        });
    });

    describe('unregister', () => {
        it('should call DELETE /sync/client', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ status: 'unregistered' })
            });

            await api.unregister();

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/smartauth/sync/client',
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });
    });

    describe('retry logic', () => {
        it('should retry on 500 error when calling pull', async () => {
            const api2 = new SyncApi({
                baseUrl: '/api',
                getAccessToken: () => 'token',
                maxRetries: 2,
                baseDelay: 10
            });

            mockFetch
                .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
                .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ changes: {} }) });

            const result = await api2.pull(['thirdparty']);

            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(result.changes).toEqual({});
        });

        it('should not retry on 400 error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Bad Request' })
            });

            await expect(api.pull(['thirdparty'])).rejects.toThrow();
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should throw after max retries', async () => {
            const api2 = new SyncApi({
                baseUrl: '/api',
                getAccessToken: () => 'token',
                maxRetries: 2,
                baseDelay: 10
            });

            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Server Error'
            });

            await expect(api2.pull(['thirdparty'])).rejects.toThrow('HTTP 500');
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('should retry on network error', async () => {
            const api2 = new SyncApi({
                baseUrl: '/api',
                getAccessToken: () => 'token',
                maxRetries: 1,
                baseDelay: 10
            });

            mockFetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ changes: {} }) });

            const result = await api2.pull(['thirdparty']);

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.changes).toEqual({});
        });
    });

    describe('error handling', () => {
        it('should parse error response', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({
                    message: 'Not found',
                    code: 'NOT_FOUND'
                })
            });

            try {
                await api.pull(['thirdparty']);
            } catch (error) {
                expect(error.message).toBe('Not found');
                expect(error.status).toBe(404);
                expect(error.code).toBe('NOT_FOUND');
            }
        });
    });
});
