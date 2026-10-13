import { z } from 'zod';

const lessonProgressSchema = z.object({
	lessonId: z.string(),
	completed: z.boolean(),
	watchedSeconds: z.number().default(0),
	lastPositionSeconds: z.number().default(0),
	lastWatchedAt: z.string(),
});

const courseProgressSchema = z.object({
	progressPercent: z.number(),
	lessons: z.array(lessonProgressSchema),
});

export { lessonProgressSchema, courseProgressSchema };
