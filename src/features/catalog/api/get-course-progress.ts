import { apiFetch } from '@/lib/http/api-client';
import { courseProgressSchema } from '@/features/catalog/schemas/course-progress.schema';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

async function getCourseProgress(courseId: string): Promise<CourseProgress> {
	const data = await apiFetch(`/api/progress/courses/${courseId}`);
	return courseProgressSchema.parse(data);
}

export { getCourseProgress };
