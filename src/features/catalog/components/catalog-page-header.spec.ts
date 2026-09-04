import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CatalogPageHeader } from '@/features/catalog/components/catalog-page-header';
import type { AreaSummary } from '@/features/catalog/model/course-catalog';

const areas: AreaSummary[] = [
	{ id: 'area-1', name: 'Discipulado', slug: 'discipulado', displayOrder: 1 },
	{ id: 'area-2', name: 'Liderança', slug: 'lideranca', displayOrder: 2 },
];

test('renders a pill for "Todas as áreas" plus one per area', () => {
	const html = renderToStaticMarkup(
		createElement(CatalogPageHeader, {
			areas,
			selectedAreaId: null,
			onSelectArea: () => {},
			search: '',
			onSearchChange: () => {},
			courseCount: 18,
			areaCount: 6,
		}),
	);

	assert.match(html, /Todas as áreas/);
	assert.match(html, /Discipulado/);
	assert.match(html, /Liderança/);
});

test('renders the real-count subtitle', () => {
	const html = renderToStaticMarkup(
		createElement(CatalogPageHeader, {
			areas,
			selectedAreaId: null,
			onSelectArea: () => {},
			search: '',
			onSearchChange: () => {},
			courseCount: 3,
			areaCount: 2,
		}),
	);

	assert.match(html, /3 cursos organizados em 2 áreas/);
});
