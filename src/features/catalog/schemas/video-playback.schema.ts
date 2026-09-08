import { z } from 'zod';

const videoPlaybackSchema = z.object({
	videoId: z.string(),
	lessonId: z.string(),
	title: z.string(),
	playbackUrl: z.string(),
	expiresAt: z.string(),
	durationSeconds: z.number(),
	status: z.string(),
});

export { videoPlaybackSchema };
