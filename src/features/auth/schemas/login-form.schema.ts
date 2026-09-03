import { z } from 'zod';

const loginFormSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, 'Informe seu e-mail.')
		.email('E-mail inválido.'),
	password: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export { loginFormSchema };
export type { LoginFormValues };
