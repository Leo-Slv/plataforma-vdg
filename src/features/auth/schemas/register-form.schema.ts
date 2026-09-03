import { z } from 'zod';

const registerFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe seu nome completo.')
		.max(200, 'Nome muito longo.'),
	email: z
		.string()
		.trim()
		.min(1, 'Informe seu e-mail.')
		.max(320, 'E-mail muito longo.')
		.email('E-mail inválido.'),
	password: z.string().min(12, 'Mínimo de 12 caracteres.'),
	captchaToken: z.string(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export { registerFormSchema };
export type { RegisterFormValues };
