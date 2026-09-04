import { z } from 'zod';

const confirmEmailFormSchema = z.object({
	token: z.string().trim().min(1, 'Informe o código recebido por e-mail.'),
});

type ConfirmEmailFormValues = z.infer<typeof confirmEmailFormSchema>;

export { confirmEmailFormSchema };
export type { ConfirmEmailFormValues };
