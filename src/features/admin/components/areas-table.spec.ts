import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { AreasTable } from '@/features/admin/components/areas-table';
import type { Area } from '@/features/admin/model/area';

function buildArea(overrides: Partial<Area>): Area {
	return {
		id: 'area-1',
		name: 'Área',
		slug: 'area',
		description: '',
		active: true,
		displayOrder: 0,
		accentColor: 'Blue',
		courseCount: 0,
		courses: [],
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
		...overrides,
	};
}

test('renders "Nenhuma área cadastrada." when there are no areas', () => {
	const html = renderToStaticMarkup(createElement(AreasTable, { areas: [] }));
	assert.match(html, /Nenhuma área cadastrada\./);
});

test('renders one row per area, sorted by displayOrder', () => {
	const areas = [
		buildArea({ id: 'b', name: 'Liderança', displayOrder: 2 }),
		buildArea({ id: 'a', name: 'Discipulado', displayOrder: 1 }),
	];

	const html = renderToStaticMarkup(createElement(AreasTable, { areas }));

	const discipuladoIndex = html.indexOf('Discipulado');
	const liderancaIndex = html.indexOf('Liderança');
	assert.ok(discipuladoIndex >= 0 && liderancaIndex >= 0);
	assert.ok(discipuladoIndex < liderancaIndex);
});

test('renders the course count and slug for each area', () => {
	const html = renderToStaticMarkup(
		createElement(AreasTable, {
			areas: [buildArea({ slug: 'discipulado', courseCount: 7 })],
		}),
	);
	assert.match(html, /\/discipulado/);
	assert.match(html, />7</);
});

test('links each row to the area edit route', () => {
	const html = renderToStaticMarkup(
		createElement(AreasTable, { areas: [buildArea({ id: 'area-42' })] }),
	);
	assert.match(
		html,
		new RegExp(`href="${appRoutes.admin.areaEdit('area-42')}"`),
	);
});

test('renders "Ativa" for an active area and "Inativa" for an inactive one', () => {
	const html = renderToStaticMarkup(
		createElement(AreasTable, {
			areas: [
				buildArea({ id: 'a', name: 'Ativa area', active: true }),
				buildArea({ id: 'b', name: 'Inativa area', active: false }),
			],
		}),
	);
	assert.match(html, /Ativa/);
	assert.match(html, /Inativa/);
});
