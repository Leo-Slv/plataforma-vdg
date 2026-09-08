import { apiFetch } from '@/lib/http/api-client';
import { lessonSchema } from '@/features/admin/schemas/lesson.schema';
import type { Lesson } from '@/features/admin/model/lesson';

type UpdateLessonPayload = {
	title: string;
	description: string;
	freePreview: boolean;
	published: boolean;
};

async function updateLesson(
	courseId: string,
	moduleId: string,
	lessonId: string,
	payload: UpdateLessonPayload,
): Promise<Lesson> {
	const data = await apiFetch(
		`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
		{ method: 'PUT', body: payload },
	);
	return lessonSchema.parse(data);
}

export { updateLesson };
export type { UpdateLessonPayload };
