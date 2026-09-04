import { z } from 'zod';

const lessonProgressSchema = z.object({
	lessonId: z.string(),
	completed: z.boolean(),
	lastWatchedAt: z.string(),
});

const courseProgressSchema = z.object({
	progressPercent: z.number(),
	lessons: z.array(lessonProgressSchema),
});

export { lessonProgressSchema, courseProgressSchema };
