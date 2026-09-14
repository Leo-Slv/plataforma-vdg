import { apiFetch } from '@/lib/http/api-client';
import { lessonQuestionSchema } from '@/features/catalog/schemas/lesson-question.schema';
import type { LessonQuestion } from '@/features/catalog/model/lesson-question';

type AskLessonQuestionInput = {
	lessonId: string;
	questionText: string;
};

async function askLessonQuestion(
	input: AskLessonQuestionInput,
): Promise<LessonQuestion> {
	const data = await apiFetch(`/api/questions/lessons/${input.lessonId}`, {
		method: 'POST',
		body: { questionText: input.questionText },
	});
	return lessonQuestionSchema.parse(data);
}

export { askLessonQuestion };
