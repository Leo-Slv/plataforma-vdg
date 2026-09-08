import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AreasGridSection } from '@/features/landing/components/areas-grid-section';
import type { PublicAreaSummary } from '@/features/landing/model/public-catalog-summary';

function buildArea(overrides: Partial<PublicAreaSummary>): PublicAreaSummary {
	return {
		id: 'area-1',
		name: 'Discipulado',
		slug: 'discipulado',
		publishedCourseCount: 6,
		...overrides,
	};
}

test('renders one cell per area with name, count, and numbering', () => {
	const html = renderToStaticMarkup(
		createElement(AreasGridSection, {
			areas: [
				buildArea({ id: 'a', name: 'Discipulado', publishedCourseCount: 6 }),
				buildArea({ id: 'b', name: 'Liderança', publishedCourseCount: 4 }),
			],
		}),
	);
	assert.match(html, />01</);
	assert.match(html, />02</);
	assert.match(html, /Discipulado/);
	assert.match(html, /6 cursos/);
	assert.match(html, /Liderança/);
	assert.match(html, /4 cursos/);
});

test('uses the singular "1 curso" for an area with exactly one course', () => {
	const html = renderToStaticMarkup(
		createElement(AreasGridSection, {
			areas: [buildArea({ publishedCourseCount: 1 })],
		}),
	);
	assert.match(html, /1 curso(?!s)/);
});
