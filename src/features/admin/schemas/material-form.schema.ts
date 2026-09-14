import { z } from 'zod';

const materialFormSchema = z
	.object({
		title: z.string().trim().min(1, 'Informe o título do material.'),
		file: z.instanceof(File).nullable(),
	})
	.superRefine((values, ctx) => {
		if (!values.file) {
			ctx.addIssue({
				code: 'custom',
				path: ['file'],
				message: 'Selecione um arquivo.',
			});
		}
	});

type MaterialFormValues = z.infer<typeof materialFormSchema>;

export { materialFormSchema };
export type { MaterialFormValues };
