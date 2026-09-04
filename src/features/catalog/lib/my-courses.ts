import { findCurrentLesson } from '@/features/catalog/lib/lesson-sequence';
import type {
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';
import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

type CourseCardState =
	| { kind: 'completed'; moduleCount: number; lessonId: string | undefined }
	| {
			kind: 'active';
			percent: number;
			modulePosition: number;
			lessonTitle: string;
			lessonId: string | undefined;
	  };

function computeCardState(
	details: CourseDetails,
	progress: CourseProgress,
): CourseCardState {
	if (progress.progressPercent === 100) {
		return {
			kind: 'completed',
			moduleCount: details.modules.length,
			lessonId: details.modules[0]?.lessons[0]?.id,
		};
	}

	const current = findCurrentLesson(details, progress);
	return {
		kind: 'active',
		percent: progress.progressPercent,
		modulePosition: current?.modulePosition ?? 1,
		lessonTitle: current?.lesson.title ?? '',
		lessonId: current?.lesson.id ?? details.modules[0]?.lessons[0]?.id,
	};
}

function latestWatchedAt(progress: CourseProgress): string | undefined {
	return progress.lessons.reduce<string | undefined>((latest, entry) => {
		return !latest || entry.lastWatchedAt > latest ? entry.lastWatchedAt : latest;
	}, undefined);
}

type OwnedCourseEntry = {
	course: CourseCatalogItem;
	areaName: string | null;
	details: CourseDetails;
	progress: CourseProgress;
};

function sortOwnedCourses(entries: OwnedCourseEntry[]): OwnedCourseEntry[] {
	return [...entries].sort((a, b) => {
		const aWatched = latestWatchedAt(a.progress);
		const bWatched = latestWatchedAt(b.progress);

		if (aWatched && bWatched) {
			return bWatched.localeCompare(aWatched);
		}
		if (aWatched) {
			return -1;
		}
		if (bWatched) {
			return 1;
		}
		return a.course.displayOrder - b.course.displayOrder;
	});
}

function pickHeroEntry(entries: OwnedCourseEntry[]): OwnedCourseEntry | undefined {
	const inProgress = entries.filter(
		(entry) =>
			entry.progress.progressPercent > 0 && entry.progress.progressPercent < 100,
	);

	if (inProgress.length === 0) {
		return undefined;
	}

	return inProgress.reduce((latest, entry) =>
		(latestWatchedAt(entry.progress) ?? '') > (latestWatchedAt(latest.progress) ?? '')
			? entry
			: latest,
	);
}

export { computeCardState, latestWatchedAt, sortOwnedCourses, pickHeroEntry };
export type { CourseCardState, OwnedCourseEntry };
