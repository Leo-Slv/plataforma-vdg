import { z } from 'zod';

const certificateSchema = z.object({
	id: z.string(),
	courseId: z.string(),
	courseTitle: z.string(),
	courseSlug: z.string(),
	issuedAt: z.string(),
});

export { certificateSchema };
