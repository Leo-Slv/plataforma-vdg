import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { FeaturedFormationSection } from '@/features/landing/components/featured-formation-section';
import type { PublicFeaturedCourse } from '@/features/landing/model/public-catalog-summary';

test('renders the real course title and both CTAs pointing at its detail route', () => {
	const course: PublicFeaturedCourse = {
		id: 'course-1',
		title: 'Escola de Líderes 2026',
		slug: 'escola-de-lideres-2026',
		description: 'Uma formação completa.',
		thumbnailUrl: null,
	};

	const html = renderToStaticMarkup(
		createElement(FeaturedFormationSection, { course }),
	);

	assert.match(html, /Escola de Líderes 2026/);
	const hrefOccurrences =
		html.split(`href="${appRoutes.courses.detail(course.slug)}"`).length - 1;
	assert.equal(hrefOccurrences, 2);
});
