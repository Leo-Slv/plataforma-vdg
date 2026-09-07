import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CoursesTable } from '@/features/admin/components/courses-table';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

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

test('renders "Nenhum curso cadastrado." when there are no courses', () => {
	const html = renderToStaticMarkup(
		createElement(CoursesTable, { courses: [], areas: [] }),
	);
	assert.match(html, /Nenhum curso cadastrado\./);
});

test('sorts rows by displayOrder', () => {
	const courses = [
		buildCourse({ id: 'b', title: 'Segundo', displayOrder: 2 }),
		buildCourse({ id: 'a', title: 'Primeiro', displayOrder: 1 }),
	];
	const html = renderToStaticMarkup(
		createElement(CoursesTable, { courses, areas: [] }),
	);
	assert.ok(html.indexOf('Primeiro') < html.indexOf('Segundo'));
});

test('renders "Gratuito" for a free course', () => {
	const html = renderToStaticMarkup(
		createElement(CoursesTable, {
			courses: [buildCourse({ pricingModel: 'Free' })],
			areas: [],
		}),
	);
	assert.match(html, /Gratuito/);
});

test('renders a formatted price for a paid course', () => {
	const html = renderToStaticMarkup(
		createElement(CoursesTable, {
			courses: [buildCourse({ pricingModel: 'Paid', priceAmount: 149 })],
			areas: [],
		}),
	);
	assert.match(html, /R\$\s?149/);
});

test('renders "Por inscrição" for an enrollment-controlled course', () => {
	const html = renderToStaticMarkup(
		createElement(CoursesTable, {
			courses: [buildCourse({ pricingModel: 'EnrollmentControlled' })],
			areas: [],
		}),
	);
	assert.match(html, /Por inscrição/);
});

test('renders "Publicado" and "Rascunho" correctly', () => {
	const html = renderToStaticMarkup(
		createElement(CoursesTable, {
			courses: [
				buildCourse({ id: 'a', published: true }),
				buildCourse({ id: 'b', published: false }),
			],
			areas: [],
		}),
	);
	assert.match(html, /Publicado/);
	assert.match(html, /Rascunho/);
});

test('resolves area ids to area names', () => {
	const html = renderToStaticMarkup(
		createElement(CoursesTable, {
			courses: [buildCourse({ areaIds: ['area-1'] })],
			areas: [buildArea({ id: 'area-1', name: 'Discipulado' })],
		}),
	);
	assert.match(html, /Discipulado/);
});
