import { z } from 'zod';

const askLessonQuestionFormSchema = z.object({
	questionText: z
		.string()
		.trim()
		.min(1, 'Escreva sua pergunta.')
		.max(2000, 'Máximo de 2000 caracteres.'),
});

type AskLessonQuestionFormValues = z.infer<typeof askLessonQuestionFormSchema>;

export { askLessonQuestionFormSchema };
export type { AskLessonQuestionFormValues };
