import { z } from 'zod';

const resetPasswordFormSchema = z
	.object({
		token: z.string().trim().min(1, 'Informe o código recebido por e-mail.'),
		newPassword: z.string().min(12, 'Mínimo de 12 caracteres.'),
		confirmPassword: z.string(),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		message: 'As senhas não conferem.',
		path: ['confirmPassword'],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export { resetPasswordFormSchema };
export type { ResetPasswordFormValues };
