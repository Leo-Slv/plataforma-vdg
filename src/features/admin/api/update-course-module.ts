import { apiFetch } from '@/lib/http/api-client';
import { courseModuleSchema } from '@/features/admin/schemas/course-module.schema';
import type { CourseModule } from '@/features/admin/model/course-module';

type UpdateCourseModulePayload = {
	title: string;
	description: string;
	published: boolean;
};

async function updateCourseModule(
	courseId: string,
	moduleId: string,
	payload: UpdateCourseModulePayload,
): Promise<CourseModule> {
	const data = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}`, {
		method: 'PUT',
		body: payload,
	});
	return courseModuleSchema.parse(data);
}

export { updateCourseModule };
export type { UpdateCourseModulePayload };
