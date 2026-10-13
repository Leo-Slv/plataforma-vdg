import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RolePermissionsEditor } from '@/features/admin/components/role-permissions-editor';
import type { Permission } from '@/features/admin/model/role-detail';

const permissions: Permission[] = [
	{ id: '1', key: 'visitors.read', name: 'Read visitors', description: '' },
	{ id: '2', key: 'videos.manage', name: 'Manage videos', description: '' },
	{ id: '3', key: 'roles.manage', name: 'Manage roles', description: '' },
];

test('renders one switch per assignable permission, reflecting what is granted', () => {
	const html = renderToStaticMarkup(
		createElement(RolePermissionsEditor, {
			permissions,
			selectedKeys: new Set(['visitors.read']),
			onToggle: () => {},
		}),
	);

	assert.equal((html.match(/role="switch"/g) ?? []).length, 2);
	assert.match(html, /Primeira vez \(ver\)/);
	assert.match(html, /Vídeos/);
	assert.doesNotMatch(html, /Manage roles/);
	assert.equal((html.match(/aria-checked="true"/g) ?? []).length, 1);
});

test('disables every switch while saving', () => {
	const html = renderToStaticMarkup(
		createElement(RolePermissionsEditor, {
			permissions,
			selectedKeys: new Set<string>(),
			onToggle: () => {},
			disabled: true,
		}),
	);

	assert.equal((html.match(/disabled=""/g) ?? []).length, 2);
});
