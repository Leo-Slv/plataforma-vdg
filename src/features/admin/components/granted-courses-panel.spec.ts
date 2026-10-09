import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { GrantedCoursesPanel } from '@/features/admin/components/granted-courses-panel';
import type { Course } from '@/features/admin/model/course';
import type { UserCourseAccess } from '@/features/admin/model/user-course-access';

function buildCourse(overrides: Partial<Course>): Course {
	return {
		id: 'course-1',
		title: 'Escola de Líderes',
		slug: 'escola-de-lideres',
		description: '',
		thumbnailUrl: null,
		published: true,
		displayOrder: 0,
		publishedAt: null,
		pricingModel: 'Paid',
		priceAmount: 149,
		issuesCertificate: false,
		isFeatured: false,
		areaIds: [],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

function buildGrant(overrides: Partial<UserCourseAccess>): UserCourseAccess {
	return {
		userId: 'user-1',
		courseId: 'course-1',
		source: 'Manual',
		grantedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

const noop = () => {};

test('renders an empty state when nothing is granted', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grants: [],
			courses: [],
			onGrant: noop,
			onRevoke: noop,
		}),
	);
	assert.match(html, /Nenhum curso liberado individualmente\./);
});

test('resolves granted course ids to titles with a source label and a revoke button', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grants: [buildGrant({ source: 'Purchase' })],
			courses: [buildCourse({ id: 'course-1', title: 'Escola de Líderes' })],
			onGrant: noop,
			onRevoke: noop,
		}),
	);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /Comprado/);
	assert.match(html, /Revogar acesso a Escola de Líderes/);
});

test('labels manual and migrated grants', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grants: [
				buildGrant({ courseId: 'a', source: 'Manual' }),
				buildGrant({ courseId: 'b', source: 'Migrated' }),
			],
			courses: [
				buildCourse({ id: 'a', title: 'Curso A' }),
				buildCourse({ id: 'b', title: 'Curso B' }),
			],
			onGrant: noop,
			onRevoke: noop,
		}),
	);
	assert.match(html, /Concedido/);
	assert.match(html, /Migrado/);
});

test('silently drops a grant whose course is not in the loaded course list', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grants: [buildGrant({ courseId: 'unknown-course' })],
			courses: [],
			onGrant: noop,
			onRevoke: noop,
		}),
	);
	assert.match(html, /Nenhum curso liberado individualmente\./);
});

test('disables the revoke button of the grant being revoked', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grants: [buildGrant({})],
			courses: [buildCourse({ id: 'course-1' })],
			onGrant: noop,
			onRevoke: noop,
			revokingCourseId: 'course-1',
		}),
	);
	assert.match(html, /Revogando…/);
	assert.match(html, /disabled/);
});
