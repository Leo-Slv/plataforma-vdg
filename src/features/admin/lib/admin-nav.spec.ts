import { test } from 'node:test';
import assert from 'node:assert/strict';

import { appRoutes } from '@/lib/routes/app-routes';
import {
	getAdminHomeRoute,
	getAdminNavItems,
} from '@/features/admin/lib/admin-nav';

const keys = (claims: Record<string, unknown> | null) =>
	getAdminNavItems(claims).map((item) => item.key);

test('a student without backoffice permissions sees no admin screen', () => {
	assert.deepEqual(keys({ role: 'Student' }), []);
	assert.deepEqual(keys(null), []);
	assert.equal(getAdminHomeRoute({ permission: 'progress.read' }), null);
});

test('the Admin role sees every screen, including Permissões, with no permission claims', () => {
	assert.deepEqual(keys({ role: 'Admin' }), [
		'courses',
		'areas',
		'users',
		'videos',
		'audit',
		'testimonials',
		'visitors',
		'roles',
	]);
	assert.equal(getAdminHomeRoute({ role: 'Admin' }), appRoutes.admin.courses);
});

test('Admin may arrive as an array of roles', () => {
	assert.equal(keys({ role: ['Student', 'Admin'] }).includes('roles'), true);
});

test('staff only see the screens their permissions unlock', () => {
	assert.deepEqual(keys({ permission: ['videos.manage', 'audit.read'] }), [
		'videos',
		'audit',
	]);
});

test('courses.manage unlocks both Cursos and Depoimentos', () => {
	assert.deepEqual(keys({ permission: 'courses.manage' }), [
		'courses',
		'testimonials',
	]);
});

test('a visitors-only staff member lands on Primeira vez', () => {
	assert.equal(
		getAdminHomeRoute({ permission: ['visitors.read', 'visitors.manage'] }),
		appRoutes.admin.visitors,
	);
});

test('holding roles.manage never unlocks Permissões (Admin only)', () => {
	assert.equal(keys({ permission: ['roles.manage'] }).includes('roles'), false);
});
