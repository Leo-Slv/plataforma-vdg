import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	findLessonById,
	findNextLessonId,
	findCurrentLesson,
} from '@/features/catalog/lib/lesson-sequence';
import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

function lesson(id: string, displayOrder: number) {
	return {
		id,
		title: `Lesson ${id}`,
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
			lessons: [lesson('l1', 1), lesson('l2', 2)],
		},
		{
			id: 'module-2',
			title: 'Doutrina essencial',
			description: '',
			displayOrder: 2,
			published: true,
			lessons: [lesson('l3', 1)],
		},
	],
};

test('findLessonById finds a lesson in the first module', () => {
	const result = findLessonById(details, 'l1');
	assert.equal(result?.module.id, 'module-1');
	assert.equal(result?.modulePosition, 1);
	assert.equal(result?.lesson.id, 'l1');
	assert.equal(result?.lessonPosition, 1);
});

test('findLessonById finds a lesson in a later module', () => {
	const result = findLessonById(details, 'l3');
	assert.equal(result?.module.id, 'module-2');
	assert.equal(result?.modulePosition, 2);
	assert.equal(result?.lesson.id, 'l3');
	assert.equal(result?.lessonPosition, 1);
});

test('findLessonById returns undefined for an unknown lessonId', () => {
	assert.equal(findLessonById(details, 'unknown'), undefined);
});

test('findNextLessonId returns the next lesson within the same module', () => {
	assert.equal(findNextLessonId(details, 'l1'), 'l2');
});

test('findNextLessonId crosses into the following module', () => {
	assert.equal(findNextLessonId(details, 'l2'), 'l3');
});

test('findNextLessonId returns undefined for the course\'s last lesson', () => {
	assert.equal(findNextLessonId(details, 'l3'), undefined);
});

test('findNextLessonId returns undefined for an unknown current lessonId', () => {
	assert.equal(findNextLessonId(details, 'unknown'), undefined);
});

function progressWith(...completedLessonIds: string[]): CourseProgress {
	return {
		progressPercent: 0,
		lessons: completedLessonIds.map((lessonId) => ({
			lessonId,
			completed: true,
			lastWatchedAt: '2026-09-04T10:00:00Z',
		})),
	};
}

test('findCurrentLesson returns the first lesson when nothing is completed', () => {
	const result = findCurrentLesson(details, progressWith());
	assert.equal(result?.lesson.id, 'l1');
});

test('findCurrentLesson returns the next lesson after completed ones', () => {
	const result = findCurrentLesson(details, progressWith('l1', 'l2'));
	assert.equal(result?.lesson.id, 'l3');
});

test('findCurrentLesson returns undefined when every lesson is completed', () => {
	const result = findCurrentLesson(details, progressWith('l1', 'l2', 'l3'));
	assert.equal(result, undefined);
});
