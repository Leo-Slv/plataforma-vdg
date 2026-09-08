import { z } from 'zod';

const moduleFormSchema = z.object({
	title: z.string().trim().min(1, 'Informe o título do módulo.'),
	description: z.string().trim(),
	published: z.boolean(),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export { moduleFormSchema };
export type { ModuleFormValues };
