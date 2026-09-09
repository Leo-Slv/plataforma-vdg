import type { Course } from '@/features/admin/model/course';
import type { CourseModule } from '@/features/admin/model/course-module';

type LessonLookupEntry = {
	courseTitle: string;
	lessonTitle: string;
	modulePosition: number;
};

/**
 * GET /api/videos returns only a lessonId, no course/lesson title — this
 * resolves a human label by walking the already-loaded admin course list
 * and each course's modules (bounded by course count, not video count;
 * see Docs/backend-pendencies/admin/videos-panel.md).
 */
function buildLessonLookup(
	courses: Course[],
	modulesByCourse: CourseModule[][],
): Map<string, LessonLookupEntry> {
	const lookup = new Map<string, LessonLookupEntry>();

	courses.forEach((course, courseIndex) => {
		const modules = modulesByCourse[courseIndex] ?? [];
		modules.forEach((courseModule) => {
			courseModule.lessons.forEach((lesson, lessonIndex) => {
				lookup.set(lesson.id, {
					courseTitle: course.title,
					lessonTitle: lesson.title,
					modulePosition: lessonIndex + 1,
				});
			});
		});
	});

	return lookup;
}

export { buildLessonLookup };
export type { LessonLookupEntry };
