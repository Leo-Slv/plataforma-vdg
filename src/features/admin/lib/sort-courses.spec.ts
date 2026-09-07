import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sortCoursesByDisplayOrder } from '@/features/admin/lib/sort-courses';
import type { Course } from '@/features/admin/model/course';

function buildCourse(overrides: Partial<Course>): Course {
	return {
		id: 'course-1',
		title: 'Curso',
		slug: 'curso',
		description: '',
		thumbnailUrl: null,
		published: true,
		displayOrder: 0,
		publishedAt: null,
		pricingModel: 'Free',
		priceAmount: null,
		issuesCertificate: true,
		isFeatured: false,
		areaIds: [],
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
		...overrides,
	};
}

test('sortCoursesByDisplayOrder orders ascending by displayOrder', () => {
	const courses = [
		buildCourse({ id: 'c', displayOrder: 3 }),
		buildCourse({ id: 'a', displayOrder: 1 }),
		buildCourse({ id: 'b', displayOrder: 2 }),
	];

	assert.deepEqual(
		sortCoursesByDisplayOrder(courses).map((course) => course.id),
		['a', 'b', 'c'],
	);
});

test('sortCoursesByDisplayOrder does not mutate the input array', () => {
	const courses = [
		buildCourse({ id: 'b', displayOrder: 2 }),
		buildCourse({ id: 'a', displayOrder: 1 }),
	];

	sortCoursesByDisplayOrder(courses);

	assert.deepEqual(
		courses.map((course) => course.id),
		['b', 'a'],
	);
});
