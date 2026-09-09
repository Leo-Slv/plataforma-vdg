import { z } from 'zod';

const profileFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe seu nome completo.')
		.max(200, 'Nome muito longo.'),
	phone: z.string().trim().max(32, 'Telefone muito longo.'),
	avatarUrl: z
		.string()
		.trim()
		.max(2048, 'URL muito longa.')
		.refine(
			(value) =>
				value.length === 0 || z.string().url().safeParse(value).success,
			'URL inválida.',
		),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export { profileFormSchema };
export type { ProfileFormValues };
