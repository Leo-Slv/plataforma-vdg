import { apiFetch } from '@/lib/http/api-client';
import { lessonQuestionSchema } from '@/features/catalog/schemas/lesson-question.schema';
import type { LessonQuestion } from '@/features/catalog/model/lesson-question';

type AnswerLessonQuestionInput = {
	questionId: string;
	answerText: string;
};

async function answerLessonQuestion(
	input: AnswerLessonQuestionInput,
): Promise<LessonQuestion> {
	const data = await apiFetch(`/api/questions/${input.questionId}/answer`, {
		method: 'POST',
		body: { answerText: input.answerText },
	});
	return lessonQuestionSchema.parse(data);
}

export { answerLessonQuestion };
