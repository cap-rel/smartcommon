import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncApi } from './SyncApi';

// ky-like instance: get/post return an object exposing .json()
const createHttp = () => {
    const reply = (value) => ({ json: () => (value instanceof Error ? Promise.reject(value) : Promise.resolve(value)) });
    return {
        nextGet: {},
        nextPost: {},
        get: vi.fn(function (url, options) { void url; void options; return reply(this.nextGet); }),
        post: vi.fn(function (url, options) { void url; void options; return reply(this.nextPost); })
    };
};

// What ky throws on a non-2xx answer
const httpError = (status, body, extra = {}) => {
    const error = new Error(`Request failed with status code ${status}`);
    error.response = {
        status,
        clone: () => ({ json: () => (body === undefined ? Promise.reject(new Error('used')) : Promise.resolve(body)) })
    };
    return Object.assign(error, extra);
};

describe('SyncApi', () => {
    let http;
    let api;

    beforeEach(() => {
        http = createHttp();
        api = new SyncApi({ getHttp: () => http });
    });

    describe('constructor', () => {
        it('requires getHttp', () => {
            expect(() => new SyncApi({})).toThrow(/getHttp/);
        });

        it('reads the http instance on every request', async () => {
            const other = createHttp();
            let current = http;
            api = new SyncApi({ getHttp: () => current });

            await api.getObjects();
            current = other;
            await api.getObjects();

            expect(http.get).toHaveBeenCalledTimes(1);
            expect(other.get).toHaveBeenCalledTimes(1);
        });

        it('fails with status 0 when no http instance is available', async () => {
            api = new SyncApi({ getHttp: () => null });
            await expect(api.getObjects()).rejects.toMatchObject({ status: 0 });
        });
    });

    describe('register', () => {
        it('posts client_uuid, sync_scope and app_version', async () => {
            http.nextPost = { client_id: 4, client_uuid: 'uuid-1', sync_scope: { thirdparty: true } };

            const result = await api.register('uuid-1', ['thirdparty'], '1.2.3');

            expect(http.post).toHaveBeenCalledWith('sync/register', {
                json: { client_uuid: 'uuid-1', sync_scope: ['thirdparty'], app_version: '1.2.3' }
            });
            expect(result.client_id).toBe(4);
            expect(api.clientUuid).toBe('uuid-1');
        });

        it('omits app_version when not given', async () => {
            await api.register('uuid-1', ['thirdparty']);
            expect(http.post.mock.calls[0][1].json).toEqual({ client_uuid: 'uuid-1', sync_scope: ['thirdparty'] });
        });

        it('sends no custom header and no URL prefix (useApi owns both)', async () => {
            await api.register('uuid-1', []);
            const [url, options] = http.post.mock.calls[0];
            expect(url).toBe('sync/register');
            expect(options.headers).toBeUndefined();
        });
    });

    describe('client-bound endpoints', () => {
        it('refuse to run before a client_uuid is set', async () => {
            await expect(api.pull('product')).rejects.toThrow(/client_uuid not set/);
            await expect(api.push('product', [])).rejects.toThrow(/client_uuid not set/);
            await expect(api.getConflicts()).rejects.toThrow(/client_uuid not set/);
            await expect(api.getStatus()).rejects.toThrow(/client_uuid not set/);
            expect(http.get).not.toHaveBeenCalled();
            expect(http.post).not.toHaveBeenCalled();
        });

        it('pull sends one object_type and client_uuid in the query', async () => {
            api.setClientUuid('uuid-1');
            http.nextGet = { updated: [], deleted: [], has_more: false, server_time: 'now' };

            await api.pull('product', { lastSyncAt: '2025-01-01T00:00:00+00:00', limit: 200 });

            expect(http.get).toHaveBeenCalledWith('sync/pull', {
                searchParams: {
                    client_uuid: 'uuid-1',
                    object_type: 'product',
                    last_sync_at: '2025-01-01T00:00:00+00:00',
                    limit: 200
                }
            });
        });

        it('pull forwards the cursor and drops empty parameters', async () => {
            api.setClientUuid('uuid-1');

            await api.pull('product', { cursor: 'abc' });

            expect(http.get.mock.calls[0][1].searchParams).toEqual({
                client_uuid: 'uuid-1',
                object_type: 'product',
                limit: 500,
                cursor: 'abc'
            });
        });

        it('push sends client_uuid, object_type and changes in the body', async () => {
            api.setClientUuid('uuid-1');
            const changes = [{ action: 'update', id: 3, base_tms: 't', data: { name: 'A' } }];

            await api.push('thirdparty', changes);

            expect(http.post).toHaveBeenCalledWith('sync/push', {
                json: { client_uuid: 'uuid-1', object_type: 'thirdparty', changes }
            });
        });

        it('conflicts and status carry client_uuid in the query', async () => {
            api.setClientUuid('uuid-1');

            await api.getConflicts();
            await api.getStatus();

            expect(http.get).toHaveBeenNthCalledWith(1, 'sync/conflicts', { searchParams: { client_uuid: 'uuid-1' } });
            expect(http.get).toHaveBeenNthCalledWith(2, 'sync/status', { searchParams: { client_uuid: 'uuid-1' } });
        });

        it('resolveConflict posts the resolution and merged data', async () => {
            await api.resolveConflict(12, 'merged', { name: 'B' });
            await api.resolveConflict(13, 'server');

            expect(http.post).toHaveBeenNthCalledWith(1, 'sync/conflicts/12/resolve', {
                json: { resolution: 'merged', data: { name: 'B' } }
            });
            expect(http.post).toHaveBeenNthCalledWith(2, 'sync/conflicts/13/resolve', {
                json: { resolution: 'server' }
            });
        });
    });

    describe('errors', () => {
        it('exposes status, code and body of an HTTP error', async () => {
            api.setClientUuid('uuid-1');
            http.nextGet = httpError(404, { error: 'Client not registered' });

            const error = await api.getStatus().catch(e => e);

            expect(error.status).toBe(404);
            expect(error.data).toEqual({ error: 'Client not registered' });
            expect(error.message).toBe('sync/status: Client not registered');
        });

        it('falls back to the fields set by useApi when the body was already read', async () => {
            api.setClientUuid('uuid-1');
            http.nextGet = httpError(400, undefined, { apiMessage: 'Invalid cursor', apiCode: 'Invalid cursor' });

            const error = await api.pull('product').catch(e => e);

            expect(error.status).toBe(400);
            expect(error.data).toBeNull();
            expect(error.message).toBe('sync/pull: Invalid cursor');
        });

        it('reports a network failure with status 0', async () => {
            http.nextPost = new TypeError('Failed to fetch');

            const error = await api.register('uuid-1', []).catch(e => e);

            expect(error.status).toBe(0);
            expect(error.message).toContain('Failed to fetch');
            expect(api.clientUuid).toBeNull();
        });
    });
});
