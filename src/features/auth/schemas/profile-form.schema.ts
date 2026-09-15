import { z } from 'zod';

const profileFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe seu nome completo.')
		.max(200, 'Nome muito longo.'),
	phone: z.string().trim().max(32, 'Telefone muito longo.'),
	// No longer user-typed free text — only ever set by the avatar upload
	// flow (a bare storage key) or already-loaded from the account (a
	// legacy pasted URL from before uploads existed), so this only needs a
	// sane length bound, not a URL-shape check.
	avatarUrl: z.string().trim().max(2048, 'Valor muito longo.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export { profileFormSchema };
export type { ProfileFormValues };
