import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { FeaturedCoursesSection } from '@/features/landing/components/featured-courses-section';
import type { PublicFeaturedCourse } from '@/features/landing/model/public-catalog-summary';

function liveCourse(overrides: Partial<PublicFeaturedCourse> = {}): PublicFeaturedCourse {
	return {
		id: 'course-1',
		title: 'Fundamentos da Fé',
		slug: 'fundamentos-da-fe',
		description: '',
		thumbnailUrl: null,
		pricingModel: 'Free',
		priceAmount: null,
		moduleCount: 6,
		lessonCount: 24,
		durationSeconds: 25200,
		areaName: 'Discipulado',
		...overrides,
	};
}

test('renders nothing while there is no live data', () => {
	assert.equal(renderToStaticMarkup(createElement(FeaturedCoursesSection)), '');
});

test('renders nothing when there are no public courses', () => {
	const html = renderToStaticMarkup(
		createElement(FeaturedCoursesSection, { liveCourses: [] }),
	);
	assert.equal(html, '');
});

test('renders one linked card per live course and no invented ones', () => {
	const html = renderToStaticMarkup(
		createElement(FeaturedCoursesSection, {
			liveCourses: [
				liveCourse(),
				liveCourse({ id: 'course-2', title: 'Casamento Blindado', slug: 'casamento-blindado' }),
			],
		}),
	);
	assert.match(html, new RegExp(`href="${appRoutes.courses.detail('fundamentos-da-fe')}"`));
	assert.match(html, new RegExp(`href="${appRoutes.courses.detail('casamento-blindado')}"`));
	assert.equal(html.split('href="/courses/').length - 1, 2);
	assert.doesNotMatch(html, /Curso de Batismo|Escola de Líderes/);
});

test('renders live stats, price and area', () => {
	const html = renderToStaticMarkup(
		createElement(FeaturedCoursesSection, {
			liveCourses: [
				liveCourse({
					pricingModel: 'Paid',
					priceAmount: 89,
					moduleCount: 11,
					lessonCount: 42,
					durationSeconds: 3600,
					areaName: 'Família',
				}),
			],
		}),
	);
	assert.match(html, /11 módulos/);
	assert.match(html, /42 aulas/);
	assert.match(html, /Família/);
	assert.match(html, /R\$\s?89/);
});
