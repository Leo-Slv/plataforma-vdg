import { z } from 'zod';

const userCourseAccessSchema = z.object({
	userId: z.string(),
	courseId: z.string(),
	// 'Manual' | 'Purchase' | 'Migrated' — kept as a string so a new backend
	// source never breaks parsing of the whole list.
	source: z.string(),
	grantedAt: z.string(),
});

export { userCourseAccessSchema };
