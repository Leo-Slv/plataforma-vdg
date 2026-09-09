import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RoleAccessToggleList } from '@/features/admin/components/role-access-toggle-list';
import type { Role } from '@/features/admin/model/role';

test('renders one toggle per role', () => {
	const roles: Role[] = [
		{ id: 'a', name: 'Admin' },
		{ id: 'b', name: 'Editor' },
	];
	const html = renderToStaticMarkup(
		createElement(RoleAccessToggleList, {
			roles,
			pendingRoleIds: new Set<string>(),
			onToggle: () => {},
		}),
	);
	assert.match(html, /Admin/);
	assert.match(html, /Editor/);
});

test('marks an assigned role as checked', () => {
	const roles: Role[] = [{ id: 'a', name: 'Admin' }];
	const html = renderToStaticMarkup(
		createElement(RoleAccessToggleList, {
			roles,
			pendingRoleIds: new Set<string>(['a']),
			onToggle: () => {},
		}),
	);
	assert.match(html, /aria-checked="true"/);
});

test('marks a non-assigned role as unchecked', () => {
	const roles: Role[] = [{ id: 'a', name: 'Editor' }];
	const html = renderToStaticMarkup(
		createElement(RoleAccessToggleList, {
			roles,
			pendingRoleIds: new Set<string>(),
			onToggle: () => {},
		}),
	);
	assert.match(html, /aria-checked="false"/);
});
