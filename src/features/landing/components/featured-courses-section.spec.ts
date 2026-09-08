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
				},
			],
		}),
	);
	assert.match(
		html,
		new RegExp(`href="${appRoutes.courses.detail(matchedSlug)}"`),
	);
});
