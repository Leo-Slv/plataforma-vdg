import { apiFetch } from '@/lib/http/api-client';

async function deleteLesson(
	courseId: string,
	moduleId: string,
	lessonId: string,
): Promise<void> {
	await apiFetch(
		`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
		{ method: 'DELETE' },
	);
}

export { deleteLesson };
