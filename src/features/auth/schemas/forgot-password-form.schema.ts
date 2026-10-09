import { z } from 'zod';

const forgotPasswordFormSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, 'Informe seu e-mail.')
		.max(320, 'E-mail muito longo.')
		.email('E-mail inválido.'),
	captchaToken: z.string(),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export { forgotPasswordFormSchema };
export type { ForgotPasswordFormValues };
