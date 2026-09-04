import { apiFetch } from '@/lib/http/api-client';
import { courseDetailsSchema } from '@/features/catalog/schemas/course-details.schema';
import type { CourseDetails } from '@/features/catalog/model/course-details';

async function getCourseDetails(courseId: string): Promise<CourseDetails> {
	const data = await apiFetch(`/api/courses/${courseId}`);
	return courseDetailsSchema.parse(data);
}

export { getCourseDetails };
