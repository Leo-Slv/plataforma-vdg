import { apiFetch } from '@/lib/http/api-client';
import { lessonSchema } from '@/features/admin/schemas/lesson.schema';
import type { Lesson } from '@/features/admin/model/lesson';

async function moveLesson(
	courseId: string,
	moduleId: string,
	lessonId: string,
	targetModuleId: string,
): Promise<Lesson> {
	const data = await apiFetch(
		`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/move`,
		{ method: 'PUT', body: { targetModuleId } },
	);
	return lessonSchema.parse(data);
}

export { moveLesson };
