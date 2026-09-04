import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	filterCourses,
	groupCoursesByArea,
} from '@/features/catalog/lib/filter-courses';
import type {
	AreaSummary,
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';

function course(overrides: Partial<CourseCatalogItem>): CourseCatalogItem {
	return {
		id: 'course-id',
		title: 'Curso de Batismo',
		slug: 'curso-de-batismo',
		description: 'Descrição',
		thumbnailUrl: null,
		displayOrder: 0,
		pricingModel: 'Free',
		areaIds: ['area-1'],
		hasAccess: true,
		...overrides,
	};
}

const discipulado: AreaSummary = {
	id: 'area-1',
	name: 'Discipulado',
	slug: 'discipulado',
	displayOrder: 1,
};
const lideranca: AreaSummary = {
	id: 'area-2',
	name: 'Liderança',
	slug: 'lideranca',
	displayOrder: 2,
};

const courses: CourseCatalogItem[] = [
	course({ id: '1', title: 'Curso de Batismo', areaIds: ['area-1'] }),
	course({ id: '2', title: 'Fundamentos da Fé', areaIds: ['area-1'] }),
	course({ id: '3', title: 'Escola de Líderes', areaIds: ['area-2'] }),
];

test('filterCourses returns everything when no filters are active', () => {
	const result = filterCourses(courses, { areaId: null, search: '' });
	assert.equal(result.length, 3);
});

test('filterCourses narrows to a single area', () => {
	const result = filterCourses(courses, { areaId: 'area-1', search: '' });
	assert.deepEqual(
		result.map((c) => c.id),
		['1', '2'],
	);
});

test('filterCourses matches the title case-insensitively', () => {
	const result = filterCourses(courses, {
		areaId: null,
		search: 'fundamentos',
	});
	assert.deepEqual(
		result.map((c) => c.id),
		['2'],
	);
});

test('filterCourses combines area and search', () => {
	const result = filterCourses(courses, {
		areaId: 'area-1',
		search: 'batismo',
	});
	assert.deepEqual(
		result.map((c) => c.id),
		['1'],
	);
});

test('groupCoursesByArea drops areas with no matching courses', () => {
	const filtered = filterCourses(courses, { areaId: null, search: 'batismo' });
	const groups = groupCoursesByArea([discipulado, lideranca], filtered);
	assert.equal(groups.length, 1);
	assert.equal(groups[0]?.area.id, 'area-1');
});

test('groupCoursesByArea keeps every area when nothing is filtered out', () => {
	const groups = groupCoursesByArea([discipulado, lideranca], courses);
	assert.equal(groups.length, 2);
	assert.equal(groups[0]?.courses.length, 2);
	assert.equal(groups[1]?.courses.length, 1);
});
