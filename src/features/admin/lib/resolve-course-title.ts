import type { Course } from '@/features/admin/model/course';

function resolveCourseTitle(
	courseId: string | null,
	courses: Course[],
): string {
	if (!courseId) {
		return '—';
	}

	return courses.find((course) => course.id === courseId)?.title ?? '—';
}

export { resolveCourseTitle };
