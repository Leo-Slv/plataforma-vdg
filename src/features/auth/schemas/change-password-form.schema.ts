import { z } from 'zod';

const changePasswordFormSchema = z.object({
	currentPassword: z.string().min(1, 'Informe sua senha atual.'),
	newPassword: z.string().min(12, 'Mínimo de 12 caracteres.'),
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export { changePasswordFormSchema };
export type { ChangePasswordFormValues };
