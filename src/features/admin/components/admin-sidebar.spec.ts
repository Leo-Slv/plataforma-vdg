import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

test('links every nav item to its real route', () => {
	const html = renderToStaticMarkup(
		createElement(AdminSidebar, {
			active: 'courses',
			claims: { role: 'Admin' },
		}),
	);

	assert.match(html, new RegExp(`href="${appRoutes.admin.courses}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.areas}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.users}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.videos}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.audit}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.testimonials}"`));
});

test('links "Voltar à plataforma" back to the catalog', () => {
	const html = renderToStaticMarkup(
		createElement(AdminSidebar, {
			active: 'courses',
			claims: { role: 'Admin' },
		}),
	);

	assert.match(html, /Voltar à plataforma/);
	assert.match(html, new RegExp(`href="${appRoutes.catalog.index}"`));
});

test('shows only the screens the staff member has permission for', () => {
	const html = renderToStaticMarkup(
		createElement(AdminSidebar, {
			active: 'visitors',
			claims: { role: 'Secretaria', permission: ['visitors.read'] },
		}),
	);

	assert.match(html, new RegExp(`href="${appRoutes.admin.visitors}"`));
	assert.doesNotMatch(html, new RegExp(`href="${appRoutes.admin.courses}"`));
	assert.doesNotMatch(html, new RegExp(`href="${appRoutes.admin.users}"`));
	assert.doesNotMatch(html, new RegExp(`href="${appRoutes.admin.roles}"`));
});

test('shows the Permissões screen only to the Admin role', () => {
	const asAdmin = renderToStaticMarkup(
		createElement(AdminSidebar, { active: 'roles', claims: { role: 'Admin' } }),
	);
	const asManager = renderToStaticMarkup(
		createElement(AdminSidebar, {
			active: 'users',
			claims: { role: 'Gestor', permission: ['roles.manage', 'users.manage'] },
		}),
	);

	assert.match(asAdmin, new RegExp(`href="${appRoutes.admin.roles}"`));
	assert.doesNotMatch(asManager, new RegExp(`href="${appRoutes.admin.roles}"`));
});
