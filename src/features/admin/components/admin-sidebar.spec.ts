import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

test('links "Cursos", "Áreas", and "Usuários" to their real routes', () => {
	const html = renderToStaticMarkup(
		createElement(AdminSidebar, { active: 'courses' }),
	);

	assert.match(html, new RegExp(`href="${appRoutes.admin.courses}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.areas}"`));
	assert.match(html, new RegExp(`href="${appRoutes.admin.users}"`));
});

test('renders "Vídeos" and "Auditoria" as inert (no href)', () => {
	const html = renderToStaticMarkup(
		createElement(AdminSidebar, { active: 'courses' }),
	);

	assert.doesNotMatch(html, /<a[^>]*>Vídeos/);
	assert.doesNotMatch(html, /<a[^>]*>Auditoria/);
});
