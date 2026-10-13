import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	createWatchTracker,
	trackSeek,
	trackTimeUpdate,
} from '@/features/catalog/lib/watch-tracker';

test('the first event only fixes the starting point', () => {
	const tracker = trackTimeUpdate(createWatchTracker(0), 10);

	assert.equal(tracker.watchedSeconds, 0);
	assert.equal(tracker.lastTime, 10);
});

test('normal playback accumulates the elapsed video time', () => {
	let tracker = createWatchTracker(0);
	for (const time of [0, 0.25, 0.5, 0.75, 1]) {
		tracker = trackTimeUpdate(tracker, time);
	}

	assert.equal(tracker.watchedSeconds, 1);
});

test('starts from what was already saved', () => {
	let tracker = createWatchTracker(120);
	tracker = trackTimeUpdate(tracker, 120);
	tracker = trackTimeUpdate(tracker, 121);

	assert.equal(tracker.watchedSeconds, 121);
});

test('a forward jump (seek) adds nothing, even without a seeking event', () => {
	let tracker = trackTimeUpdate(createWatchTracker(0), 5);
	tracker = trackTimeUpdate(tracker, 600);

	assert.equal(tracker.watchedSeconds, 0);
	assert.equal(tracker.lastTime, 600);
});

test('going backwards adds nothing', () => {
	let tracker = trackTimeUpdate(createWatchTracker(0), 50);
	tracker = trackTimeUpdate(tracker, 10);

	assert.equal(tracker.watchedSeconds, 0);
});

test('after a seek the next update is not measured against the old position', () => {
	let tracker = trackTimeUpdate(createWatchTracker(0), 5);
	tracker = trackSeek(tracker);
	tracker = trackTimeUpdate(tracker, 90);
	tracker = trackTimeUpdate(tracker, 91);

	assert.equal(tracker.watchedSeconds, 1);
});

test('a negative saved value is treated as zero', () => {
	assert.equal(createWatchTracker(-5).watchedSeconds, 0);
});
