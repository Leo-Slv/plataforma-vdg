import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AdminModuleCard } from '@/features/admin/components/admin-module-card';
import type { CourseModule } from '@/features/admin/model/course-module';
import type { Lesson } from '@/features/admin/model/lesson';

function buildLesson(overrides: Partial<Lesson>): Lesson {
	return {
		id: 'lesson-1',
		moduleId: 'module-1',
		title: 'Aula',
		description: '',
		displayOrder: 0,
		freePreview: false,
		published: true,
		videoId: null,
		durationSeconds: null,
		...overrides,
	};
}

function buildModule(overrides: Partial<CourseModule>): CourseModule {
	return {
		id: 'module-1',
		courseId: 'course-1',
		title: 'Fundamentos da liderança',
		description: '',
		displayOrder: 0,
		published: true,
		lessons: [],
		...overrides,
	};
}

const noop = () => {};

function render(courseModule: CourseModule) {
	return renderToStaticMarkup(
		createElement(AdminModuleCard, {
			courseModule,
			position: 0,
			canMoveUp: false,
			canMoveDown: false,
			onMoveUp: noop,
			onMoveDown: noop,
			onEdit: noop,
			onDelete: noop,
			isDeletingModule: false,
			onAddLesson: noop,
			onEditLesson: noop,
			onMoveLessonUp: noop,
			onMoveLessonDown: noop,
			onDeleteLesson: noop,
			deletingLessonId: null,
			lessonDeleteError: null,
		}),
	);
}

test('delete is disabled when the module still has lessons', () => {
	const html = render(buildModule({ lessons: [buildLesson({})] }));
	assert.match(
		html,
		/disabled=""[^>]*title="Remova todas as aulas[^"]*"[^>]*>Excluir/,
	);
});

test('delete is enabled when the module has no lessons', () => {
	const html = render(buildModule({ lessons: [] }));
	assert.doesNotMatch(html, /disabled=""[^>]*>Excluir/);
});

test('renders the lesson count', () => {
	const html = render(
		buildModule({
			lessons: [buildLesson({ id: 'a' }), buildLesson({ id: 'b' })],
		}),
	);
	assert.match(html, /2 aulas/);
});

test('renders each nested lesson title', () => {
	const html = render(
		buildModule({
			lessons: [buildLesson({ id: 'a', title: 'Chamado e caráter' })],
		}),
	);
	assert.match(html, /Chamado e caráter/);
});
