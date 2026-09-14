import { z } from 'zod';

const lessonQuestionSchema = z.object({
	id: z.string(),
	askedByName: z.string(),
	questionText: z.string(),
	answerText: z.string().nullable(),
	answeredByName: z.string().nullable(),
	createdAt: z.string(),
});

export { lessonQuestionSchema };
