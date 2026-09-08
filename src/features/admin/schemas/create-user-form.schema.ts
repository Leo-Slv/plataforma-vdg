import { z } from 'zod';

const createUserFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe o nome.')
		.max(200, 'Nome muito longo.'),
	email: z
		.string()
		.trim()
		.min(1, 'Informe o e-mail.')
		.max(320, 'E-mail muito longo.')
		.email('E-mail inválido.'),
	password: z.string().min(12, 'Mínimo de 12 caracteres.'),
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export { createUserFormSchema };
export type { CreateUserFormValues };
