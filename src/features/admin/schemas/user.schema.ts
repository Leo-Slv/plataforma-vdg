import { z } from 'zod';

const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	active: z.boolean(),
	emailVerifiedAt: z.string().nullable(),
	roleNames: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const pagedUsersSchema = z.object({
	page: z.object({
		items: z.array(userSchema),
		page: z.number(),
		pageSize: z.number(),
		totalItems: z.number(),
		totalPages: z.number(),
	}),
	totalRegistered: z.number(),
	totalConfirmed: z.number(),
});

export { userSchema, pagedUsersSchema };
