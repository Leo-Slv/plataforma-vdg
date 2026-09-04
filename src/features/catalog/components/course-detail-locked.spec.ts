import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CourseDetailLocked } from '@/features/catalog/components/course-detail-locked';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';

function course(overrides: Partial<CourseCatalogItem>): CourseCatalogItem {
	return {
		id: 'course-1',
		title: 'Escola de Líderes',
		slug: 'escola-de-lideres',
		description: 'Uma formação de líderes.',
		thumbnailUrl: null,
		displayOrder: 0,
		pricingModel: 'Free',
		areaIds: ['area-1'],
		hasAccess: false,
		...overrides,
	};
}

test('renders "Gratuito" for a free course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Free' }),
			areaName: 'Discipulado',
		}),
	);

	assert.match(html, /Gratuito/);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /Discipulado/);
});

test('renders "Pago" for a paid course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid' }),
			areaName: 'Liderança',
		}),
	);

	assert.match(html, /Pago/);
});
