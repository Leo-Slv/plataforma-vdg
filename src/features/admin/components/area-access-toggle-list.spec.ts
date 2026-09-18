import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AreaAccessToggleList } from '@/features/admin/components/area-access-toggle-list';
import type { Area } from '@/features/admin/model/area';

function buildArea(overrides: Partial<Area>): Area {
	return {
		id: 'area-1',
		name: 'Discipulado',
		slug: 'discipulado',
		description: '',
		active: true,
		isPublic: false,
		displayOrder: 0,
		accentColor: '#000000',
		imageUrl: null,
		courseCount: 0,
		courses: [],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

test('renders one toggle per area', () => {
	const html = renderToStaticMarkup(
		createElement(AreaAccessToggleList, {
			areas: [
				buildArea({ id: 'a', name: 'Discipulado' }),
				buildArea({ id: 'b', name: 'Liderança' }),
			],
			pendingGrantedAreaIds: new Set<string>(),
			roleGrantedAreaIds: new Set<string>(),
			onToggle: () => {},
		}),
	);
	assert.match(html, /Discipulado/);
	assert.match(html, /Liderança/);
});

test('marks a granted area as checked', () => {
	const html = renderToStaticMarkup(
		createElement(AreaAccessToggleList, {
			areas: [buildArea({ id: 'a', name: 'Discipulado' })],
			pendingGrantedAreaIds: new Set<string>(['a']),
			roleGrantedAreaIds: new Set<string>(),
			onToggle: () => {},
		}),
	);
	assert.match(html, /aria-checked="true"/);
});

test('marks a non-granted area as unchecked', () => {
	const html = renderToStaticMarkup(
		createElement(AreaAccessToggleList, {
			areas: [buildArea({ id: 'a', name: 'Família' })],
			pendingGrantedAreaIds: new Set<string>(),
			roleGrantedAreaIds: new Set<string>(),
			onToggle: () => {},
		}),
	);
	assert.match(html, /aria-checked="false"/);
});

test('marks a role-granted area as checked, disabled, with an explanatory note', () => {
	const html = renderToStaticMarkup(
		createElement(AreaAccessToggleList, {
			areas: [buildArea({ id: 'a', name: 'Admin' })],
			pendingGrantedAreaIds: new Set<string>(),
			roleGrantedAreaIds: new Set<string>(['a']),
			onToggle: () => {},
		}),
	);
	assert.match(html, /aria-checked="true"/);
	assert.match(html, /disabled=""/);
	assert.match(html, /Liberada pelo papel do usuário/);
});

test('a role-granted area stays checked even without an individual grant', () => {
	const html = renderToStaticMarkup(
		createElement(AreaAccessToggleList, {
			areas: [buildArea({ id: 'a', name: 'Admin' })],
			pendingGrantedAreaIds: new Set<string>(),
			roleGrantedAreaIds: new Set<string>(['a']),
			onToggle: () => {},
		}),
	);
	assert.doesNotMatch(html, /aria-checked="false"/);
});
