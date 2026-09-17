import { z } from 'zod';

const lessonQuestionSchema = z.object({
	id: z.string(),
	askedByName: z.string(),
	askedByAvatarUrl: z.string().nullable(),
	questionText: z.string(),
	answerText: z.string().nullable(),
	answeredByName: z.string().nullable(),
	answeredByAvatarUrl: z.string().nullable(),
	answeredAt: z.string().nullable(),
	createdAt: z.string(),
});

export { lessonQuestionSchema };
