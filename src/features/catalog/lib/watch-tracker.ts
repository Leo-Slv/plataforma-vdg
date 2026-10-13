/**
 * Counts how much of a video was really played. A `timeupdate` that advances by
 * a small step is playback; a big jump (or a backwards one) is a seek and adds
 * nothing, so dragging the bar to the end does not count as watching.
 */
type WatchTracker = {
	/** Seconds really played so far (fractional), starting from what was saved. */
	watchedSeconds: number;
	/** Last player time seen, or `null` right after a seek / on start. */
	lastTime: number | null;
};

/** Largest forward step of `currentTime` between two events that still counts as playing. */
const MAX_PLAYBACK_STEP_SECONDS = 2;

function createWatchTracker(initialWatchedSeconds: number): WatchTracker {
	return {
		watchedSeconds: Math.max(0, initialWatchedSeconds),
		lastTime: null,
	};
}

function trackTimeUpdate(
	tracker: WatchTracker,
	currentTime: number,
): WatchTracker {
	const step = tracker.lastTime === null ? 0 : currentTime - tracker.lastTime;
	const played = step > 0 && step <= MAX_PLAYBACK_STEP_SECONDS ? step : 0;

	return {
		watchedSeconds: tracker.watchedSeconds + played,
		lastTime: currentTime,
	};
}

/** Call on `seeking`: the next `timeupdate` must not be measured against the old position. */
function trackSeek(tracker: WatchTracker): WatchTracker {
	return { ...tracker, lastTime: null };
}

export {
	MAX_PLAYBACK_STEP_SECONDS,
	createWatchTracker,
	trackSeek,
	trackTimeUpdate,
};
export type { WatchTracker };
