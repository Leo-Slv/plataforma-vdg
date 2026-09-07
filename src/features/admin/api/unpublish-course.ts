import { apiFetch } from '@/lib/http/api-client';
import { courseSchema } from '@/features/admin/schemas/course.schema';
import type { Course } from '@/features/admin/model/course';

async function unpublishCourse(courseId: string): Promise<Course> {
	const data = await apiFetch(`/api/courses/${courseId}/unpublish`, {
		method: 'POST',
	});
	return courseSchema.parse(data);
}

export { unpublishCourse };
