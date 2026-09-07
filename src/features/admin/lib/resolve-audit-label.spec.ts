import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveAuditLabel } from '@/features/admin/lib/resolve-audit-label';
import type { AuditLog } from '@/features/admin/model/audit-log';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

function buildEntry(overrides: Partial<AuditLog>): AuditLog {
	return {
		id: 'log-1',
		userId: null,
		action: 'CoursePublished',
		entityName: 'Course',
		entityId: 'course-1',
		metadata: {},
		createdAt: '2026-09-07T18:00:00Z',
		...overrides,
	};
}

const course: Course = {
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
};

const area: Area = {
	id: 'area-1',
	name: 'Liderança',
	slug: 'lideranca',
	description: '',
	active: true,
	displayOrder: 0,
	accentColor: 'Blue',
	courseCount: 0,
	courses: [],
	createdAt: '2026-01-01T00:00:00Z',
	updatedAt: '2026-01-01T00:00:00Z',
};

test('resolves a Course entity to its title', () => {
	const entry = buildEntry({ entityName: 'Course', entityId: 'course-1' });
	assert.equal(
		resolveAuditLabel(entry, [course], []),
		'CoursePublished · Curso de Batismo',
	);
});

test('resolves an Area entity to its name', () => {
	const entry = buildEntry({
		action: 'AreaUpdated',
		entityName: 'Area',
		entityId: 'area-1',
	});
	assert.equal(resolveAuditLabel(entry, [], [area]), 'AreaUpdated · Liderança');
});

test('falls back to EntityName + short id when the entity is not loaded', () => {
	const entry = buildEntry({
		action: 'VideoCreated',
		entityName: 'Video',
		entityId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
	});
	assert.equal(
		resolveAuditLabel(entry, [], []),
		'VideoCreated · Video #a1b2c3d4',
	);
});

test('falls back when the referenced Course id is not in the loaded list', () => {
	const entry = buildEntry({ entityName: 'Course', entityId: 'missing' });
	assert.equal(
		resolveAuditLabel(entry, [course], []),
		'CoursePublished · Course #missing',
	);
});

test('renders just the action when there is no entityId', () => {
	const entry = buildEntry({
		action: 'LoginSucceeded',
		entityName: 'User',
		entityId: null,
	});
	assert.equal(resolveAuditLabel(entry, [], []), 'LoginSucceeded');
});
