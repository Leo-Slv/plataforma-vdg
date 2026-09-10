import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

test('links every nav item to its real route', () => {
	const html = renderToStaticMarkup(
		createElement(AdminSidebar, { active: 'courses' }),
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
		createElement(AdminSidebar, { active: 'courses' }),
	);

	assert.match(html, /Voltar à plataforma/);
	assert.match(html, new RegExp(`href="${appRoutes.catalog.index}"`));
});
