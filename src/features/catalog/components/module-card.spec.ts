import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ModuleCard } from '@/features/catalog/components/module-card';
import type { CourseModule } from '@/features/catalog/model/course-details';

const module1: CourseModule = {
	id: 'module-1',
	title: 'Chamado e caráter',
	description: 'O ponto de partida da formação.',
	displayOrder: 1,
	published: true,
	lessons: [
		{
			id: 'l1',
			title: 'Aula 1',
			description: '',
			displayOrder: 1,
			freePreview: false,
			published: true,
		},
		{
			id: 'l2',
			title: 'Aula 2',
			description: '',
			displayOrder: 2,
			freePreview: false,
			published: true,
		},
	],
};

test('renders the module title and the "Módulo 0N · X aulas" eyebrow', () => {
	const html = renderToStaticMarkup(
		createElement(ModuleCard, {
			module: module1,
			position: 1,
			slug: 'escola-de-lideres',
		}),
	);

	assert.match(html, /Chamado e caráter/);
	assert.match(html, /Módulo 01 · 2 aulas/);
});

test('links to its first lesson when it has lessons', () => {
	const html = renderToStaticMarkup(
		createElement(ModuleCard, {
			module: module1,
			position: 1,
			slug: 'escola-de-lideres',
		}),
	);

	assert.match(
		html,
		/<a[^>]*href="\/courses\/escola-de-lideres\/lessons\/l1"/,
	);
});

test('is not a link when the module has no lessons', () => {
	const emptyModule: CourseModule = { ...module1, lessons: [] };
	const html = renderToStaticMarkup(
		createElement(ModuleCard, {
			module: emptyModule,
			position: 1,
			slug: 'escola-de-lideres',
		}),
	);
	assert.doesNotMatch(html, /<a /);
});

test('uses the singular "aula" for a module with exactly one lesson', () => {
	const singleLessonModule: CourseModule = {
		...module1,
		lessons: [module1.lessons[0]!],
	};
	const html = renderToStaticMarkup(
		createElement(ModuleCard, {
			module: singleLessonModule,
			position: 1,
			slug: 'escola-de-lideres',
		}),
	);
	assert.match(html, /Módulo 01 · 1 aula(?!s)/);
});
