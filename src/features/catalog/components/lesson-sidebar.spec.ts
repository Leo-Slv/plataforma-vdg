import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LessonSidebar } from '@/features/catalog/components/lesson-sidebar';
import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

function lesson(id: string, title: string, displayOrder: number) {
	return {
		id,
		title,
		description: '',
		displayOrder,
		freePreview: false,
		published: true,
	};
}

const details: CourseDetails = {
	id: 'course-1',
	title: 'Escola de Líderes',
	slug: 'escola-de-lideres',
	description: '',
	thumbnailUrl: null,
	pricingModel: 'Paid',
	areaIds: [],
	modules: [
		{
			id: 'module-1',
			title: 'Chamado e caráter',
			description: '',
			displayOrder: 1,
			published: true,
			lessons: [
				lesson('l1', 'O caráter do líder', 1),
				lesson('l2', 'Servindo com integridade', 2),
			],
		},
		{
			id: 'module-2',
			title: 'Doutrina essencial',
			description: '',
			displayOrder: 2,
			published: true,
			lessons: [lesson('l3', 'Fundamentos da fé', 1)],
		},
	],
};

const progress: CourseProgress = {
	progressPercent: 33.33,
	lessons: [{ lessonId: 'l1', completed: true }],
};

test('renders every module and lesson title', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	assert.match(html, /Chamado e caráter/);
	assert.match(html, /Doutrina essencial/);
	assert.match(html, /O caráter do líder/);
	assert.match(html, /Servindo com integridade/);
	assert.match(html, /Fundamentos da fé/);
});

test('links each lesson to its own URL', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	assert.match(html, /href="\/courses\/escola-de-lideres\/lessons\/l1"/);
	assert.match(html, /href="\/courses\/escola-de-lideres\/lessons\/l2"/);
	assert.match(html, /href="\/courses\/escola-de-lideres\/lessons\/l3"/);
});

test('marks the current lesson with the play glyph, not a checkmark', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	const currentRow = html.match(
		/<a[^>]*href="\/courses\/escola-de-lideres\/lessons\/l2"[^]*?<\/a>/,
	)?.[0];
	assert.ok(currentRow);
	assert.match(currentRow, /▶/);
	assert.doesNotMatch(currentRow, /✓/);
});

test('marks a completed, non-current lesson with a checkmark', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	const completedRow = html.match(
		/<a[^>]*href="\/courses\/escola-de-lideres\/lessons\/l1"[^]*?<\/a>/,
	)?.[0];
	assert.ok(completedRow);
	assert.match(completedRow, /✓/);
});

test('marks a not-started, non-current lesson with neither glyph', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	const notStartedRow = html.match(
		/<a[^>]*href="\/courses\/escola-de-lideres\/lessons\/l3"[^]*?<\/a>/,
	)?.[0];
	assert.ok(notStartedRow);
	assert.doesNotMatch(notStartedRow, /▶/);
	assert.doesNotMatch(notStartedRow, /✓/);
});

test('renders no duration anywhere', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	assert.doesNotMatch(html, /\d+:\d{2}/);
});

test('renders gracefully with no progress data (falls back to no checkmarks)', () => {
	const html = renderToStaticMarkup(
		createElement(LessonSidebar, {
			details,
			progress: undefined,
			currentLessonId: 'l2',
			slug: 'escola-de-lideres',
		}),
	);

	assert.doesNotMatch(html, /✓/);
	assert.match(html, /▶/);
});
