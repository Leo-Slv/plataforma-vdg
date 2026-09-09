import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { FeaturedFormationSection } from '@/features/landing/components/featured-formation-section';
import type { PublicFeaturedCourse } from '@/features/landing/model/public-catalog-summary';

const course: PublicFeaturedCourse = {
	id: 'course-1',
	title: 'Escola de Líderes 2026',
	slug: 'escola-de-lideres-2026',
	description: 'Uma formação completa.',
	thumbnailUrl: null,
	pricingModel: 'Paid',
	priceAmount: 149,
	moduleCount: 8,
	lessonCount: 41,
	durationSeconds: 43200,
	areaName: 'Liderança',
};

test('renders the real course title and both CTAs pointing at its detail route', () => {
	const html = renderToStaticMarkup(
		createElement(FeaturedFormationSection, { course }),
	);

	assert.match(html, /Escola de Líderes 2026/);
	const hrefOccurrences =
		html.split(`href="${appRoutes.courses.detail(course.slug)}"`).length - 1;
	assert.equal(hrefOccurrences, 2);
});

test('renders real stats, area, price, and description instead of hardcoded copy', () => {
	const html = renderToStaticMarkup(
		createElement(FeaturedFormationSection, { course }),
	);

	assert.match(html, /Liderança/);
	assert.match(html, /8 módulos/);
	assert.match(html, /41 aulas/);
	assert.match(html, /12h/);
	assert.match(html, /R\$\s?149/);
	assert.match(html, /Uma formação completa\./);
});
