import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

/** Must match the backend `Progress:LessonCompletionThresholdPercent` (default 90). */
const COMPLETION_THRESHOLD = 0.9;

/**
 * How close a lesson is to counting as done, from 0 to 1. It reaches 1 at the
 * completion threshold (not at the end of the video), so a lesson at 90% of
 * watched time shows as full, exactly when the backend completes it.
 */
function lessonFraction(
	watchedSeconds: number,
	durationSeconds: number | null,
	completed: boolean,
): number {
	if (completed) {
		return 1;
	}
	if (!durationSeconds || durationSeconds <= 0 || watchedSeconds <= 0) {
		return 0;
	}
	return Math.min(1, watchedSeconds / (durationSeconds * COMPLETION_THRESHOLD));
}

type LiveWatch = { lessonId: string; watchedSeconds: number };

function savedWatchedSeconds(
	progress: CourseProgress | undefined,
	lessonId: string,
) {
	return (
		progress?.lessons.find((entry) => entry.lessonId === lessonId)
			?.watchedSeconds ?? 0
	);
}

/** Watched time to show for a lesson: the live value wins while it is the one playing. */
function effectiveWatchedSeconds(
	progress: CourseProgress | undefined,
	lessonId: string,
	live?: LiveWatch,
) {
	const saved = savedWatchedSeconds(progress, lessonId);
	return live && live.lessonId === lessonId
		? Math.max(saved, live.watchedSeconds)
		: saved;
}

function lessonFractionFor(
	details: CourseDetails,
	progress: CourseProgress | undefined,
	lessonId: string,
	live?: LiveWatch,
) {
	const lesson = details.modules
		.flatMap((module) => module.lessons)
		.find((candidate) => candidate.id === lessonId);
	const completed = Boolean(
		progress?.lessons.some(
			(entry) => entry.lessonId === lessonId && entry.completed,
		),
	);

	return lessonFraction(
		effectiveWatchedSeconds(progress, lessonId, live),
		lesson?.durationSeconds ?? null,
		completed,
	);
}

/**
 * Course percentage including the partial progress of lessons in progress, so
 * the bar moves while a video plays. It only shows 100 when every lesson is
 * completed, never from rounding.
 */
function courseLivePercent(
	details: CourseDetails,
	progress: CourseProgress | undefined,
	live?: LiveWatch,
): number {
	const lessons = details.modules.flatMap((module) => module.lessons);
	if (lessons.length === 0) {
		return 0;
	}

	const fractions = lessons.map((lesson) =>
		lessonFractionFor(details, progress, lesson.id, live),
	);
	const percent =
		(fractions.reduce((sum, value) => sum + value, 0) / lessons.length) * 100;
	const allDone = fractions.every((value) => value >= 1);

	return allDone ? 100 : Math.min(99, Math.round(percent));
}

export {
	COMPLETION_THRESHOLD,
	courseLivePercent,
	effectiveWatchedSeconds,
	lessonFraction,
	lessonFractionFor,
	savedWatchedSeconds,
};
export type { LiveWatch };
