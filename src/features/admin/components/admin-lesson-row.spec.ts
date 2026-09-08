import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AdminLessonRow } from '@/features/admin/components/admin-lesson-row';
import type { Lesson } from '@/features/admin/model/lesson';

function buildLesson(overrides: Partial<Lesson>): Lesson {
	return {
		id: 'lesson-1',
		moduleId: 'module-1',
		title: 'Chamado e caráter',
		description: '',
		displayOrder: 0,
		freePreview: false,
		published: true,
		videoId: null,
		durationSeconds: null,
		...overrides,
	};
}

const noop = () => {};

test('renders "Gratuita" badge for a free-preview lesson', () => {
	const html = renderToStaticMarkup(
		createElement(AdminLessonRow, {
			lesson: buildLesson({ freePreview: true }),
			position: 0,
			canMoveUp: false,
			canMoveDown: false,
			onMoveUp: noop,
			onMoveDown: noop,
			onEdit: noop,
			onDelete: noop,
			isDeleting: false,
		}),
	);
	assert.match(html, /Gratuita/);
});

test('renders "Paga" badge for a non-free-preview lesson', () => {
	const html = renderToStaticMarkup(
		createElement(AdminLessonRow, {
			lesson: buildLesson({ freePreview: false }),
			position: 0,
			canMoveUp: false,
			canMoveDown: false,
			onMoveUp: noop,
			onMoveDown: noop,
			onEdit: noop,
			onDelete: noop,
			isDeleting: false,
		}),
	);
	assert.match(html, /Paga/);
});

test('renders "sem vídeo" when there is no video', () => {
	const html = renderToStaticMarkup(
		createElement(AdminLessonRow, {
			lesson: buildLesson({ videoId: null, durationSeconds: null }),
			position: 0,
			canMoveUp: false,
			canMoveDown: false,
			onMoveUp: noop,
			onMoveDown: noop,
			onEdit: noop,
			onDelete: noop,
			isDeleting: false,
		}),
	);
	assert.match(html, /sem vídeo/);
});

test('renders the duration when a video is present', () => {
	const html = renderToStaticMarkup(
		createElement(AdminLessonRow, {
			lesson: buildLesson({ videoId: 'video-1', durationSeconds: 720 }),
			position: 0,
			canMoveUp: false,
			canMoveDown: false,
			onMoveUp: noop,
			onMoveDown: noop,
			onEdit: noop,
			onDelete: noop,
			isDeleting: false,
		}),
	);
	assert.match(html, /12min · vídeo pronto/);
});

test('renders the delete error message for this lesson when given', () => {
	const html = renderToStaticMarkup(
		createElement(AdminLessonRow, {
			lesson: buildLesson({}),
			position: 0,
			canMoveUp: false,
			canMoveDown: false,
			onMoveUp: noop,
			onMoveDown: noop,
			onEdit: noop,
			onDelete: noop,
			isDeleting: false,
			deleteError: 'Esta aula tem progresso registrado.',
		}),
	);
	assert.match(html, /Esta aula tem progresso registrado\./);
});
