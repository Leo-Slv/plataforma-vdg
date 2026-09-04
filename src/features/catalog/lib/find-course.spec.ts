import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	findCourseBySlug,
	findPrimaryAreaName,
} from '@/features/catalog/lib/find-course';
import type {
	AreaSummary,
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';

const course: CourseCatalogItem = {
	id: 'course-1',
	title: 'Escola de Líderes',
	slug: 'escola-de-lideres',
	description: 'Uma formação de líderes.',
	thumbnailUrl: null,
	displayOrder: 0,
	pricingModel: 'Paid',
	areaIds: ['area-2'],
	hasAccess: false,
};

const areas: AreaSummary[] = [
	{ id: 'area-1', name: 'Discipulado', slug: 'discipulado', displayOrder: 1 },
	{ id: 'area-2', name: 'Liderança', slug: 'lideranca', displayOrder: 2 },
];

test('findCourseBySlug finds a matching course', () => {
	const result = findCourseBySlug([course], 'escola-de-lideres');
	assert.equal(result?.id, 'course-1');
});

test('findCourseBySlug returns undefined for an unknown slug', () => {
	const result = findCourseBySlug([course], 'nao-existe');
	assert.equal(result, undefined);
});

test("findPrimaryAreaName finds the course's area", () => {
	assert.equal(findPrimaryAreaName(areas, course), 'Liderança');
});

test('findPrimaryAreaName returns null when the area id is not in the list', () => {
	const orphanCourse: CourseCatalogItem = { ...course, areaIds: ['area-99'] };
	assert.equal(findPrimaryAreaName(areas, orphanCourse), null);
});
