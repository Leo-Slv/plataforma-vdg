import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { GrantedCoursesPanel } from '@/features/admin/components/granted-courses-panel';
import type { Course } from '@/features/admin/model/course';

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

const noop = () => {};

test('renders "Nenhum curso pago concedido." when nothing is granted', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grantedCourseIds: [],
			courses: [],
			onGrant: noop,
		}),
	);
	assert.match(html, /Nenhum curso pago concedido\./);
});

test('resolves granted course ids to titles', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grantedCourseIds: ['course-1'],
			courses: [buildCourse({ id: 'course-1', title: 'Escola de Líderes' })],
			onGrant: noop,
		}),
	);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /Comprado/);
});

test('silently drops a granted id that is not in the loaded course list', () => {
	const html = renderToStaticMarkup(
		createElement(GrantedCoursesPanel, {
			grantedCourseIds: ['unknown-course'],
			courses: [],
			onGrant: noop,
		}),
	);
	assert.match(html, /Nenhum curso pago concedido\./);
});
