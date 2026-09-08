import { z } from 'zod';

const lessonEditorFormSchema = z.object({
	title: z.string().trim().min(1, 'Informe o título da aula.'),
	description: z.string().trim(),
	freePreview: z.boolean(),
	published: z.boolean(),
});

type LessonEditorFormValues = z.infer<typeof lessonEditorFormSchema>;

export { lessonEditorFormSchema };
export type { LessonEditorFormValues };
