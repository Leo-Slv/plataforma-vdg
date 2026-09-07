import { test } from 'node:test';
import assert from 'node:assert/strict';

import { decodeJwtPayload, hasPermission } from '@/lib/auth/jwt-claims';

function buildToken(payload: Record<string, unknown>) {
	const base64Url = (value: string) =>
		Buffer.from(value)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

	const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const body = base64Url(JSON.stringify(payload));
	return `${header}.${body}.signature`;
}

test('decodeJwtPayload decodes a well-formed token', () => {
	const claims = decodeJwtPayload(buildToken({ permission: 'areas.manage' }));
	assert.deepEqual(claims, { permission: 'areas.manage' });
});

test('decodeJwtPayload returns null for a token with the wrong number of segments', () => {
	assert.equal(decodeJwtPayload('not-a-jwt'), null);
});

test('decodeJwtPayload returns null for a payload segment that is not valid base64url JSON', () => {
	assert.equal(decodeJwtPayload('header.not-base64-json.signature'), null);
});

test('hasPermission matches a single string claim', () => {
	assert.equal(
		hasPermission({ permission: 'areas.manage' }, 'areas.manage'),
		true,
	);
	assert.equal(
		hasPermission({ permission: 'users.manage' }, 'areas.manage'),
		false,
	);
});

test('hasPermission matches within an array claim', () => {
	assert.equal(
		hasPermission(
			{ permission: ['users.manage', 'areas.manage'] },
			'areas.manage',
		),
		true,
	);
	assert.equal(
		hasPermission({ permission: ['users.manage'] }, 'areas.manage'),
		false,
	);
});

test('hasPermission returns false when there are no claims or no permission claim', () => {
	assert.equal(hasPermission(null, 'areas.manage'), false);
	assert.equal(hasPermission({}, 'areas.manage'), false);
});
