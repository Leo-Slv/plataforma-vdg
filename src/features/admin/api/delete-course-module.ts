import { apiFetch } from '@/lib/http/api-client';

async function deleteCourseModule(
	courseId: string,
	moduleId: string,
): Promise<void> {
	await apiFetch(`/api/courses/${courseId}/modules/${moduleId}`, {
		method: 'DELETE',
	});
}

export { deleteCourseModule };
