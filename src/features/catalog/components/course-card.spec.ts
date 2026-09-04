import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { CourseCard } from '@/features/catalog/components/course-card';
import type {
	AreaSummary,
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';

const area: AreaSummary = {
	id: 'area-1',
	name: 'Discipulado',
	slug: 'discipulado',
	displayOrder: 1,
};

function course(overrides: Partial<CourseCatalogItem>): CourseCatalogItem {
	return {
		id: 'course-1',
		title: 'Curso de Batismo',
		slug: 'curso-de-batismo',
		description: 'Uma introdução ao batismo.',
		thumbnailUrl: null,
		displayOrder: 0,
		pricingModel: 'Free',
		areaIds: ['area-1'],
		hasAccess: true,
		...overrides,
	};
}

test('links to the course detail stub route', () => {
	const html = renderToStaticMarkup(
		createElement(CourseCard, { course: course({}), area }),
	);
	assert.match(
		html,
		new RegExp(`href="${appRoutes.courses.detail('curso-de-batismo')}"`),
	);
});

test('renders no badge for an unlocked course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseCard, { course: course({ hasAccess: true }), area }),
	);
	assert.doesNotMatch(html, /Gratuito/);
	assert.doesNotMatch(html, /Pago/);
});

test('renders "Gratuito" for a locked free course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseCard, {
			course: course({ hasAccess: false, pricingModel: 'Free' }),
			area,
		}),
	);
	assert.match(html, /Gratuito/);
});

test('renders "Pago" for a locked paid course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseCard, {
			course: course({ hasAccess: false, pricingModel: 'Paid' }),
			area,
		}),
	);
	assert.match(html, /Pago/);
});
