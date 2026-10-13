import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	courseLivePercent,
	lessonFraction,
} from '@/features/catalog/lib/lesson-progress';
import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

function lesson(id: string, durationSeconds: number | null) {
	return {
		id,
		title: id,
		description: '',
		displayOrder: 1,
		freePreview: false,
		published: true,
		videoId: durationSeconds ? `video-${id}` : null,
		durationSeconds,
	};
}

const details = {
	id: 'course-1',
	title: 'Curso',
	slug: 'curso',
	description: '',
	thumbnailUrl: null,
	pricingModel: 'Paid',
	priceAmount: 10,
	hasAccess: true,
	certificateIssued: true,
	areaIds: [],
	modules: [
		{
			id: 'm1',
			title: 'M1',
			description: '',
			displayOrder: 1,
			published: true,
			imageUrl: null,
			lessons: [lesson('a', 100), lesson('b', 100)],
		},
	],
} as CourseDetails;

function progress(
	...entries: { lessonId: string; completed: boolean; watched: number }[]
): CourseProgress {
	return {
		progressPercent: 0,
		lessons: entries.map((entry) => ({
			lessonId: entry.lessonId,
			completed: entry.completed,
			watchedSeconds: entry.watched,
			lastPositionSeconds: 0,
			lastWatchedAt: '2026-10-13T00:00:00Z',
		})),
	};
}

test('a lesson is full at the 90% completion point, not at the end of the video', () => {
	assert.equal(lessonFraction(90, 100, false), 1);
	assert.equal(lessonFraction(45, 100, false), 0.5);
});

test('a completed lesson is always full', () => {
	assert.equal(lessonFraction(0, null, true), 1);
});

test('a lesson with no known duration shows no partial progress', () => {
	assert.equal(lessonFraction(50, null, false), 0);
	assert.equal(lessonFraction(50, 0, false), 0);
});

test('the course bar moves while the current lesson plays', () => {
	const saved = progress({ lessonId: 'a', completed: false, watched: 0 });

	assert.equal(courseLivePercent(details, saved), 0);
	// 45s of 100 = half of the way to the 90s completion point => half of one of two lessons.
	assert.equal(
		courseLivePercent(details, saved, { lessonId: 'a', watchedSeconds: 45 }),
		25,
	);
});

test('the live value of another lesson does not leak into this one', () => {
	const saved = progress({ lessonId: 'b', completed: false, watched: 0 });

	assert.equal(
		courseLivePercent(details, saved, { lessonId: 'a', watchedSeconds: 45 }),
		25,
	);
	assert.equal(courseLivePercent(details, saved), 0);
});

test('never shows 100% until every lesson is completed', () => {
	const almost = progress(
		{ lessonId: 'a', completed: true, watched: 100 },
		{ lessonId: 'b', completed: false, watched: 89 },
	);

	// 89s is just below the 90s completion point: the second lesson is not done yet.
	assert.equal(courseLivePercent(details, almost), 99);
});

test('is 100% when every lesson is completed', () => {
	const done = progress(
		{ lessonId: 'a', completed: true, watched: 100 },
		{ lessonId: 'b', completed: true, watched: 100 },
	);

	assert.equal(courseLivePercent(details, done), 100);
});
