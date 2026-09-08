import { z } from 'zod';

const lessonSchema = z.object({
	id: z.string(),
	moduleId: z.string(),
	title: z.string(),
	description: z.string(),
	displayOrder: z.number(),
	freePreview: z.boolean(),
	published: z.boolean(),
	videoId: z.string().nullable(),
	durationSeconds: z.number().nullable(),
});

export { lessonSchema };
