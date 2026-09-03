import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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
