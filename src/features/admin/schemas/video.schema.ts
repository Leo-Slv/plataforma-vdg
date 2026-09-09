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
	visibility: z.enum(['Active', 'Unlisted']),
	youTubeVideoId: z.string().nullable(),
	youTubeUrl: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const pagedVideosSchema = z.object({
	items: z.array(videoSchema),
	page: z.number(),
	pageSize: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

export { videoSchema, pagedVideosSchema };
