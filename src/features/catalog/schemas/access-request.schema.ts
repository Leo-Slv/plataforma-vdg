import { z } from 'zod';

const accessRequestSchema = z.object({
	id: z.string(),
	userId: z.string(),
	courseId: z.string(),
	// 'Pending' | 'Approved' | 'Rejected' — kept as a string so a new backend
	// status never breaks parsing of the whole list.
	status: z.string(),
	decidedAt: z.string().nullable(),
	decidedByUserId: z.string().nullable(),
	createdAt: z.string(),
});

export { accessRequestSchema };
