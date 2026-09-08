import { apiFetch } from '@/lib/http/api-client';

async function reorderLessons(
	courseId: string,
	moduleId: string,
	lessonIds: string[],
): Promise<void> {
	await apiFetch(
		`/api/courses/${courseId}/modules/${moduleId}/lessons/reorder`,
		{ method: 'PUT', body: { lessonIds } },
	);
}

export { reorderLessons };
