import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { OwnedCourseCard } from '@/features/catalog/components/owned-course-card';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseCardState } from '@/features/catalog/lib/my-courses';

const course: CourseCatalogItem = {
	id: 'course-1',
	title: 'Fundamentos da Fé',
	slug: 'fundamentos-da-fe',
	description: '',
	thumbnailUrl: null,
	displayOrder: 0,
	pricingModel: 'Free',
	areaIds: [],
	hasAccess: true,
};

test('renders the completed meta/status lines and links to the given lesson', () => {
	const state: CourseCardState = { kind: 'completed', moduleCount: 6, lessonId: 'l1' };
	const html = renderToStaticMarkup(
		createElement(OwnedCourseCard, {
			course,
			areaName: 'Discipulado',
			slug: 'fundamentos-da-fe',
			state,
		}),
	);

	assert.match(html, /Discipulado · 6 módulos/);
	assert.match(html, /100% concluído · rever/);
	assert.match(html, /<a[^>]*href="\/courses\/fundamentos-da-fe\/lessons\/l1"/);
});

test('renders the active meta/status lines for an in-progress course', () => {
	const state: CourseCardState = {
		kind: 'active',
		percent: 66,
		modulePosition: 2,
		lessonTitle: 'A nova identidade',
		lessonId: 'l2',
	};
	const html = renderToStaticMarkup(
		createElement(OwnedCourseCard, {
			course,
			areaName: 'Discipulado',
			slug: 'fundamentos-da-fe',
			state,
		}),
	);

	assert.match(html, /Discipulado · Módulo 02/);
	assert.match(html, /A nova identidade/);
	assert.match(html, /66% concluído · continuar/);
});

test('renders "começar" instead of "continuar" at exactly 0%', () => {
	const state: CourseCardState = {
		kind: 'active',
		percent: 0,
		modulePosition: 1,
		lessonTitle: 'Dons e talentos',
		lessonId: 'l1',
	};
	const html = renderToStaticMarkup(
		createElement(OwnedCourseCard, { course, areaName: null, slug: 'x', state }),
	);

	assert.match(html, /0% concluído · começar/);
});

test('is not a link when lessonId is undefined', () => {
	const state: CourseCardState = {
		kind: 'active',
		percent: 0,
		modulePosition: 1,
		lessonTitle: '',
		lessonId: undefined,
	};
	const html = renderToStaticMarkup(
		createElement(OwnedCourseCard, { course, areaName: null, slug: 'x', state }),
	);

	assert.doesNotMatch(html, /<a /);
});

test('renders no duration-shaped text anywhere', () => {
	const state: CourseCardState = { kind: 'completed', moduleCount: 6, lessonId: 'l1' };
	const html = renderToStaticMarkup(
		createElement(OwnedCourseCard, { course, areaName: null, slug: 'x', state }),
	);

	assert.doesNotMatch(html, /\d+:\d{2}/);
	assert.doesNotMatch(html, /restam|restantes/i);
});

test('the loading state renders only the title, no status line', () => {
	const html = renderToStaticMarkup(
		createElement(OwnedCourseCard, {
			course,
			areaName: 'Discipulado',
			slug: 'x',
			state: { kind: 'loading' },
		}),
	);

	assert.match(html, /Fundamentos da Fé/);
	assert.doesNotMatch(html, /concluído/);
});
