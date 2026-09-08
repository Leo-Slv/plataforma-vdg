import { apiFetch } from '@/lib/http/api-client';
import { courseModuleSchema } from '@/features/admin/schemas/course-module.schema';
import type { CourseModule } from '@/features/admin/model/course-module';

type CreateCourseModulePayload = {
	title: string;
	description: string;
};

async function createCourseModule(
	courseId: string,
	payload: CreateCourseModulePayload,
): Promise<CourseModule> {
	const data = await apiFetch(`/api/courses/${courseId}/modules`, {
		method: 'POST',
		body: payload,
	});
	return courseModuleSchema.parse(data);
}

export { createCourseModule };
export type { CreateCourseModulePayload };
