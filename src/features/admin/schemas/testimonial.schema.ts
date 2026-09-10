import { z } from 'zod';

const testimonialSchema = z.object({
	id: z.string(),
	authorName: z.string(),
	quote: z.string(),
	avatarUrl: z.string().nullable(),
	courseId: z.string().nullable(),
	published: z.boolean(),
	submittedByUserId: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export { testimonialSchema };
