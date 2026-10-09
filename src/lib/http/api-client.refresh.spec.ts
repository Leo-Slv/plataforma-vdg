import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { apiFetch } from '@/lib/http/api-client';
import { ApiError } from '@/lib/http/api-error';
import { getAccessToken, setAccessToken } from '@/lib/auth/access-token';

type FetchCall = { url: string; authorization: string | null; method: string };

const originalFetch = globalThis.fetch;
const originalWindow = (globalThis as { window?: unknown }).window;
let calls: FetchCall[] = [];
let assigned: string[] = [];

function installWindow(pathname = '/catalog') {
	const store = new Map<string, string>();
	(globalThis as { window?: unknown }).window = {
		localStorage: {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => void store.set(key, value),
			removeItem: (key: string) => void store.delete(key),
		},
		location: {
			pathname,
			assign: (url: string) => void assigned.push(url),
		},
	};
}

function json(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function stubFetch(handler: (call: FetchCall) => Response) {
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const headers = new Headers(init?.headers);
		const call: FetchCall = {
			url: String(input),
			authorization: headers.get('Authorization'),
			method: init?.method ?? 'GET',
		};
		calls.push(call);
		return handler(call);
	}) as typeof fetch;
}

beforeEach(() => {
	calls = [];
	assigned = [];
	installWindow();
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	(globalThis as { window?: unknown }).window = originalWindow;
});

test('retries once with a new token after a 401 when the refresh succeeds', async () => {
	setAccessToken('expired-token');
	stubFetch((call) => {
		if (call.url.endsWith('/api/auth/refresh-token')) {
			return json(200, { token: { accessToken: 'fresh-token' } });
		}
		return call.authorization === 'Bearer fresh-token'
			? json(200, { ok: true })
			: json(401, { statusCode: 401, message: 'expired' });
	});

	const result = await apiFetch<{ ok: boolean }>('/api/orders/me');

	assert.deepEqual(result, { ok: true });
	assert.equal(getAccessToken(), 'fresh-token');
	assert.deepEqual(
		calls.map((call) => call.url.replace(/^.*\/api/, '/api')),
		['/api/orders/me', '/api/auth/refresh-token', '/api/orders/me'],
	);
	assert.deepEqual(assigned, []);
});

test('shares one refresh between concurrent 401s', async () => {
	setAccessToken('expired-token');
	stubFetch((call) => {
		if (call.url.endsWith('/api/auth/refresh-token')) {
			return json(200, { token: { accessToken: 'fresh-token' } });
		}
		return call.authorization === 'Bearer fresh-token'
			? json(200, {})
			: json(401, { statusCode: 401, message: 'expired' });
	});

	await Promise.all([
		apiFetch('/api/a'),
		apiFetch('/api/b'),
		apiFetch('/api/c'),
	]);

	assert.equal(
		calls.filter((call) => call.url.endsWith('/api/auth/refresh-token')).length,
		1,
	);
});

test('clears the session and sends the user to login when the refresh fails', async () => {
	setAccessToken('expired-token');
	stubFetch((call) =>
		call.url.endsWith('/api/auth/refresh-token')
			? json(401, { statusCode: 401, message: 'no refresh token' })
			: json(401, { statusCode: 401, message: 'expired' }),
	);

	await assert.rejects(
		() => apiFetch('/api/orders/me'),
		(error: unknown) => error instanceof ApiError && error.status === 401,
	);

	assert.equal(getAccessToken(), null);
	assert.deepEqual(assigned, ['/login']);
});

test('does not try to refresh when there is no session', async () => {
	stubFetch(() => json(401, { statusCode: 401, message: 'nope' }));

	await assert.rejects(() => apiFetch('/api/orders/me'));

	assert.equal(calls.length, 1);
	assert.deepEqual(assigned, []);
});

test('does not refresh on login failures (wrong credentials are not an expired session)', async () => {
	setAccessToken('some-token');
	stubFetch(() =>
		json(401, { statusCode: 401, message: 'invalid credentials' }),
	);

	await assert.rejects(() =>
		apiFetch('/api/auth/login', { method: 'POST', body: {} }),
	);

	assert.equal(calls.length, 1);
	assert.equal(getAccessToken(), 'some-token');
});

test('does not refresh for non-401 errors', async () => {
	setAccessToken('some-token');
	stubFetch(() => json(409, { statusCode: 409, message: 'conflict' }));

	await assert.rejects(() =>
		apiFetch('/api/courses/x/checkout', { method: 'POST' }),
	);

	assert.equal(calls.length, 1);
});

test('does not redirect to login when already there', async () => {
	installWindow('/login');
	setAccessToken('expired-token');
	stubFetch(() => json(401, { statusCode: 401, message: 'expired' }));

	await assert.rejects(() => apiFetch('/api/auth/me'));

	assert.deepEqual(assigned, []);
});
