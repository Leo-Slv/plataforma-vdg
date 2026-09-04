import type {
	CourseDetails,
	CourseModule,
	Lesson,
} from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

type LessonLocation = {
	module: CourseModule;
	modulePosition: number;
	lesson: Lesson;
	lessonPosition: number;
};

function findLessonById(
	details: CourseDetails,
	lessonId: string,
): LessonLocation | undefined {
	for (let index = 0; index < details.modules.length; index += 1) {
		const courseModule = details.modules[index]!;
		const lessonIndex = courseModule.lessons.findIndex(
			(lesson) => lesson.id === lessonId,
		);

		if (lessonIndex !== -1) {
			return {
				module: courseModule,
				modulePosition: index + 1,
				lesson: courseModule.lessons[lessonIndex]!,
				lessonPosition: lessonIndex + 1,
			};
		}
	}

	return undefined;
}

function flattenLessons(details: CourseDetails): Lesson[] {
	return details.modules.flatMap((module) => module.lessons);
}

function findNextLessonId(
	details: CourseDetails,
	currentLessonId: string,
): string | undefined {
	const flat = flattenLessons(details);
	const index = flat.findIndex((lesson) => lesson.id === currentLessonId);

	if (index === -1 || index === flat.length - 1) {
		return undefined;
	}

	return flat[index + 1]!.id;
}

function findCurrentLesson(
	details: CourseDetails,
	progress: CourseProgress,
): LessonLocation | undefined {
	const completedIds = new Set(
		progress.lessons
			.filter((entry) => entry.completed)
			.map((entry) => entry.lessonId),
	);
	const flat = flattenLessons(details);
	const current = flat.find((lesson) => !completedIds.has(lesson.id));

	return current ? findLessonById(details, current.id) : undefined;
}

export { findLessonById, findNextLessonId, findCurrentLesson };
export type { LessonLocation };
