import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	computeCardState,
	latestWatchedAt,
	sortOwnedCourses,
	pickHeroEntry,
} from '@/features/catalog/lib/my-courses';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';
import type { OwnedCourseEntry } from '@/features/catalog/lib/my-courses';

function lesson(id: string, displayOrder: number, title = `Lesson ${id}`) {
	return {
		id,
		title,
		description: '',
		displayOrder,
		freePreview: false,
		published: true,
	};
}

function makeDetails(): CourseDetails {
	return {
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
				lessons: [lesson('l1', 1, 'O caráter do líder'), lesson('l2', 2)],
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
}

function makeCourse(overrides: Partial<CourseCatalogItem> = {}): CourseCatalogItem {
	return {
		id: 'course-1',
		title: 'Escola de Líderes',
		slug: 'escola-de-lideres',
		description: '',
		thumbnailUrl: null,
		displayOrder: 0,
		pricingModel: 'Paid',
		areaIds: [],
		hasAccess: true,
		...overrides,
	};
}

function makeProgress(
	percent: number,
	lessons: CourseProgress['lessons'] = [],
): CourseProgress {
	return { progressPercent: percent, lessons };
}

test('computeCardState returns completed with the real module count at 100%', () => {
	const state = computeCardState(makeDetails(), makeProgress(100));
	assert.deepEqual(state, {
		kind: 'completed',
		moduleCount: 2,
		lessonId: 'l1',
	});
});

test('computeCardState returns active with the first lesson at 0%', () => {
	const state = computeCardState(makeDetails(), makeProgress(0));
	assert.equal(state.kind, 'active');
	if (state.kind === 'active') {
		assert.equal(state.percent, 0);
		assert.equal(state.modulePosition, 1);
		assert.equal(state.lessonTitle, 'O caráter do líder');
		assert.equal(state.lessonId, 'l1');
	}
});

test('computeCardState returns active with the current lesson mid-course', () => {
	const progress = makeProgress(50, [
		{ lessonId: 'l1', completed: true, lastWatchedAt: '2026-09-04T10:00:00Z' },
	]);
	const state = computeCardState(makeDetails(), progress);
	assert.equal(state.kind, 'active');
	if (state.kind === 'active') {
		assert.equal(state.modulePosition, 1);
		assert.equal(state.lessonId, 'l2');
	}
});

test('latestWatchedAt picks the max timestamp', () => {
	const progress = makeProgress(50, [
		{ lessonId: 'l1', completed: true, lastWatchedAt: '2026-09-01T10:00:00Z' },
		{ lessonId: 'l2', completed: false, lastWatchedAt: '2026-09-03T10:00:00Z' },
	]);
	assert.equal(latestWatchedAt(progress), '2026-09-03T10:00:00Z');
});

test('latestWatchedAt returns undefined for a course with no progress rows', () => {
	assert.equal(latestWatchedAt(makeProgress(0)), undefined);
});

function entry(overrides: Partial<OwnedCourseEntry> = {}): OwnedCourseEntry {
	return {
		course: makeCourse(),
		areaName: null,
		details: makeDetails(),
		progress: makeProgress(0),
		...overrides,
	};
}

test('sortOwnedCourses orders two touched courses by recency', () => {
	const older = entry({
		course: makeCourse({ id: 'a', displayOrder: 0 }),
		progress: makeProgress(20, [
			{ lessonId: 'l1', completed: false, lastWatchedAt: '2026-09-01T10:00:00Z' },
		]),
	});
	const newer = entry({
		course: makeCourse({ id: 'b', displayOrder: 1 }),
		progress: makeProgress(20, [
			{ lessonId: 'l1', completed: false, lastWatchedAt: '2026-09-03T10:00:00Z' },
		]),
	});

	const sorted = sortOwnedCourses([older, newer]);
	assert.deepEqual(sorted.map((e) => e.course.id), ['b', 'a']);
});

test('sortOwnedCourses puts a touched course before an untouched one regardless of displayOrder', () => {
	const untouched = entry({ course: makeCourse({ id: 'a', displayOrder: 0 }) });
	const touched = entry({
		course: makeCourse({ id: 'b', displayOrder: 5 }),
		progress: makeProgress(20, [
			{ lessonId: 'l1', completed: false, lastWatchedAt: '2026-09-03T10:00:00Z' },
		]),
	});

	const sorted = sortOwnedCourses([untouched, touched]);
	assert.deepEqual(sorted.map((e) => e.course.id), ['b', 'a']);
});

test('sortOwnedCourses orders two untouched courses by displayOrder', () => {
	const first = entry({ course: makeCourse({ id: 'a', displayOrder: 2 }) });
	const second = entry({ course: makeCourse({ id: 'b', displayOrder: 1 }) });

	const sorted = sortOwnedCourses([first, second]);
	assert.deepEqual(sorted.map((e) => e.course.id), ['b', 'a']);
});

test('pickHeroEntry picks the most recently watched among strictly in-progress entries', () => {
	const older = entry({
		course: makeCourse({ id: 'a' }),
		progress: makeProgress(20, [
			{ lessonId: 'l1', completed: false, lastWatchedAt: '2026-09-01T10:00:00Z' },
		]),
	});
	const newer = entry({
		course: makeCourse({ id: 'b' }),
		progress: makeProgress(60, [
			{ lessonId: 'l1', completed: false, lastWatchedAt: '2026-09-03T10:00:00Z' },
		]),
	});

	assert.equal(pickHeroEntry([older, newer])?.course.id, 'b');
});

test('pickHeroEntry excludes 0% and 100% entries', () => {
	const notStarted = entry({ course: makeCourse({ id: 'a' }), progress: makeProgress(0) });
	const completed = entry({ course: makeCourse({ id: 'b' }), progress: makeProgress(100) });

	assert.equal(pickHeroEntry([notStarted, completed]), undefined);
});

test('pickHeroEntry returns undefined when nothing qualifies', () => {
	assert.equal(pickHeroEntry([]), undefined);
});
