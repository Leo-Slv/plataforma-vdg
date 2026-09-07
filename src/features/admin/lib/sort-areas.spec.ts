import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sortAreasByDisplayOrder } from '@/features/admin/lib/sort-areas';
import type { Area } from '@/features/admin/model/area';

function buildArea(overrides: Partial<Area>): Area {
	return {
		id: 'area-1',
		name: 'Área',
		slug: 'area',
		description: '',
		active: true,
		displayOrder: 0,
		accentColor: 'Blue',
		courseCount: 0,
		courses: [],
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
		...overrides,
	};
}

test('sortAreasByDisplayOrder orders ascending by displayOrder', () => {
	const areas = [
		buildArea({ id: 'c', displayOrder: 3 }),
		buildArea({ id: 'a', displayOrder: 1 }),
		buildArea({ id: 'b', displayOrder: 2 }),
	];

	const sorted = sortAreasByDisplayOrder(areas);

	assert.deepEqual(
		sorted.map((area) => area.id),
		['a', 'b', 'c'],
	);
});

test('sortAreasByDisplayOrder does not mutate the input array', () => {
	const areas = [
		buildArea({ id: 'b', displayOrder: 2 }),
		buildArea({ id: 'a', displayOrder: 1 }),
	];

	sortAreasByDisplayOrder(areas);

	assert.deepEqual(
		areas.map((area) => area.id),
		['b', 'a'],
	);
});
