import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	describePermission,
	listAssignablePermissions,
} from '@/features/admin/lib/permission-labels';
import { isSamePermissionSet } from '@/features/admin/lib/is-same-permission-set';
import type { Permission } from '@/features/admin/model/role-detail';

const permission = (key: string): Permission => ({
	id: key,
	key,
	name: `name:${key}`,
	description: `desc:${key}`,
});

test('describes known permissions in Portuguese', () => {
	assert.equal(describePermission(permission('videos.manage')).label, 'Vídeos');
});

test('falls back to the server text for an unknown permission', () => {
	assert.deepEqual(describePermission(permission('new.thing')), {
		label: 'name:new.thing',
		description: 'desc:new.thing',
	});
});

test('hides roles.manage because role management is Admin only', () => {
	const keys = listAssignablePermissions([
		permission('roles.manage'),
		permission('users.manage'),
	]).map((item) => item.key);

	assert.deepEqual(keys, ['users.manage']);
});

test('isSamePermissionSet compares regardless of order', () => {
	assert.equal(isSamePermissionSet(new Set(['a', 'b']), ['b', 'a']), true);
	assert.equal(isSamePermissionSet(new Set(['a']), ['a', 'b']), false);
	assert.equal(isSamePermissionSet(new Set(['a', 'c']), ['a', 'b']), false);
});
