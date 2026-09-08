import { apiFetch } from '@/lib/http/api-client';

async function reorderCourseModules(
	courseId: string,
	moduleIds: string[],
): Promise<void> {
	await apiFetch(`/api/courses/${courseId}/modules/reorder`, {
		method: 'PUT',
		body: { moduleIds },
	});
}

export { reorderCourseModules };
