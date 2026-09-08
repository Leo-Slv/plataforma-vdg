import { z } from 'zod';

const lessonFormSchema = z.object({
	title: z.string().trim().min(1, 'Informe o título da aula.'),
	description: z.string().trim(),
	freePreview: z.boolean(),
	published: z.boolean(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

export { lessonFormSchema };
export type { LessonFormValues };
