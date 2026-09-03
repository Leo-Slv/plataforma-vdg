import { z } from 'zod';

const authTokenResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string().nullish(),
	expiresAt: z.string(),
});

const authResponseSchema = z.object({
	userId: z.string(),
	name: z.string(),
	email: z.string(),
	roles: z.array(z.string()),
	token: authTokenResponseSchema,
});

export { authResponseSchema, authTokenResponseSchema };
