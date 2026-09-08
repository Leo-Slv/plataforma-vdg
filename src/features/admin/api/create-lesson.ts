import { apiFetch } from '@/lib/http/api-client';
import { lessonSchema } from '@/features/admin/schemas/lesson.schema';
import type { Lesson } from '@/features/admin/model/lesson';

type CreateLessonPayload = {
	title: string;
	description: string;
	freePreview: boolean;
};

async function createLesson(
	courseId: string,
	moduleId: string,
	payload: CreateLessonPayload,
): Promise<Lesson> {
	const data = await apiFetch(
		`/api/courses/${courseId}/modules/${moduleId}/lessons`,
		{ method: 'POST', body: payload },
	);
	return lessonSchema.parse(data);
}

export { createLesson };
export type { CreateLessonPayload };
