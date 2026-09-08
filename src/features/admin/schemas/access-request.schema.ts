import { z } from 'zod';

const accessRequestSchema = z.object({
	id: z.string(),
	userId: z.string(),
	courseId: z.string(),
	status: z.string(),
	decidedAt: z.string().nullable(),
	decidedByUserId: z.string().nullable(),
	createdAt: z.string(),
});

export { accessRequestSchema };
