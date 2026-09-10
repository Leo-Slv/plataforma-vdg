import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveCourseTitle } from '@/features/admin/lib/resolve-course-title';
import type { Course } from '@/features/admin/model/course';

function buildCourse(overrides: Partial<Course>): Course {
	return {
		id: 'course-1',
		title: 'Curso de Batismo',
		slug: 'curso-de-batismo',
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

test('resolves a known course id to its title', () => {
	const course = buildCourse({ id: 'course-1', title: 'Curso de Batismo' });
	assert.equal(resolveCourseTitle('course-1', [course]), 'Curso de Batismo');
});

test('renders an em dash when courseId is null', () => {
	assert.equal(resolveCourseTitle(null, []), '—');
});

test('renders an em dash when the course id is not in the loaded list', () => {
	const course = buildCourse({ id: 'course-1' });
	assert.equal(resolveCourseTitle('unknown', [course]), '—');
});
