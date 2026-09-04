import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MyCoursesHero } from '@/features/catalog/components/my-courses-hero';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseCardState } from '@/features/catalog/lib/my-courses';

const course: CourseCatalogItem = {
	id: 'course-1',
	title: 'Escola de Líderes',
	slug: 'escola-de-lideres',
	description: '',
	thumbnailUrl: null,
	displayOrder: 0,
	pricingModel: 'Paid',
	areaIds: [],
	hasAccess: true,
};

const state: Extract<CourseCardState, { kind: 'active' }> = {
	kind: 'active',
	percent: 32,
	modulePosition: 1,
	lessonTitle: 'O chamado antes da função',
	lessonId: 'l1',
};

test('renders the module/lesson-title eyebrow and real percent', () => {
	const html = renderToStaticMarkup(
		createElement(MyCoursesHero, { course, slug: 'escola-de-lideres', state }),
	);

	assert.match(html, /Escola de Líderes/);
	assert.match(html, /Módulo 01 · O chamado antes da função/);
	assert.match(html, /32%/);
});

test('links "Retomar aula" to the given lesson', () => {
	const html = renderToStaticMarkup(
		createElement(MyCoursesHero, { course, slug: 'escola-de-lideres', state }),
	);

	assert.match(
		html,
		/<a[^>]*href="\/courses\/escola-de-lideres\/lessons\/l1"[^]*?Retomar aula/,
	);
});
