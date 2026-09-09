import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { featuredCourses } from '@/features/landing/lib/landing-content';
import { FeaturedCoursesSection } from '@/features/landing/components/featured-courses-section';

test('renders all three featured courses', () => {
	const html = renderToStaticMarkup(createElement(FeaturedCoursesSection));

	for (const course of featuredCourses) {
		const occurrences = html.split(course.title).length - 1;
		assert.equal(
			occurrences,
			2,
			`expected "${course.title}" once for desktop and once for mobile`,
		);
	}
});

test('does not link a card when no live course matches its slug', () => {
	const html = renderToStaticMarkup(createElement(FeaturedCoursesSection));
	for (const course of featuredCourses) {
		assert.doesNotMatch(
			html,
			new RegExp(`href="${appRoutes.courses.detail(course.slug)}"`),
		);
	}
});

test('links a card to the course detail route when a live course matches its slug', () => {
	const matchedSlug = featuredCourses[0].slug;
	const html = renderToStaticMarkup(
		createElement(FeaturedCoursesSection, {
			liveCourses: [
				{
					id: 'course-1',
					title: featuredCourses[0].title,
					slug: matchedSlug,
					description: '',
					thumbnailUrl: null,
					pricingModel: 'Free',
					priceAmount: null,
					moduleCount: 6,
					lessonCount: 24,
					durationSeconds: 25200,
					areaName: 'Discipulado',
				},
			],
		}),
	);
	assert.match(
		html,
		new RegExp(`href="${appRoutes.courses.detail(matchedSlug)}"`),
	);
});

test('renders live stats/price/area instead of the editorial fallback when matched', () => {
	const matchedSlug = featuredCourses[0].slug;
	const html = renderToStaticMarkup(
		createElement(FeaturedCoursesSection, {
			liveCourses: [
				{
					id: 'course-1',
					title: featuredCourses[0].title,
					slug: matchedSlug,
					description: '',
					thumbnailUrl: null,
					pricingModel: 'Paid',
					priceAmount: 89,
					moduleCount: 11,
					lessonCount: 42,
					durationSeconds: 3600,
					areaName: 'Família',
				},
			],
		}),
	);
	assert.match(html, /11 módulos/);
	assert.match(html, /42 aulas/);
	assert.match(html, /Família/);
	assert.match(html, /R\$\s?89/);
});
