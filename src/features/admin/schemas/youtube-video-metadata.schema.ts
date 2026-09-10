import { z } from 'zod';

const youTubeVideoMetadataSchema = z.object({
	title: z.string(),
	thumbnailUrl: z.string(),
	durationSeconds: z.number(),
});

export { youTubeVideoMetadataSchema };
