import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { lessonQuestionSchema } from '@/features/catalog/schemas/lesson-question.schema';
import type { LessonQuestion } from '@/features/catalog/model/lesson-question';

async function getLessonQuestions(lessonId: string): Promise<LessonQuestion[]> {
	const data = await apiFetch(`/api/questions/lessons/${lessonId}`);
	return z.array(lessonQuestionSchema).parse(data);
}

export { getLessonQuestions };
