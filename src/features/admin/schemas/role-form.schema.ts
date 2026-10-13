import { z } from 'zod';

const roleFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe o nome do papel.')
		.max(100, 'Nome muito longo.'),
	description: z.string().trim().max(500, 'Descrição muito longa.'),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export { roleFormSchema };
export type { RoleFormValues };
