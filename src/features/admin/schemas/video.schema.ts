import { z } from 'zod';

const videoSchema = z.object({
	id: z.string(),
	lessonId: z.string(),
	title: z.string(),
	description: z.string(),
	storageProvider: z.string(),
	storageKey: z.string(),
	playbackUrl: z.string().nullable(),
	thumbnailUrl: z.string().nullable(),
	durationSeconds: z.number(),
	sizeBytes: z.number(),
	status: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export { videoSchema };
