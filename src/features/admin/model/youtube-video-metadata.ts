import type { z } from 'zod';

import type { youTubeVideoMetadataSchema } from '@/features/admin/schemas/youtube-video-metadata.schema';

type YouTubeVideoMetadata = z.infer<typeof youTubeVideoMetadataSchema>;

export type { YouTubeVideoMetadata };
