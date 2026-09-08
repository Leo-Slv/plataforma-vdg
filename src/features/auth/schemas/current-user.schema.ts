import { z } from 'zod';

const currentUserSchema = z.object({
	userId: z.string(),
	name: z.string(),
	email: z.string(),
	active: z.boolean(),
	emailVerifiedAt: z.string().nullable(),
	roles: z.array(z.string()),
});

export { currentUserSchema };
