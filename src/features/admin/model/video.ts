import type { z } from 'zod';

import type {
	videoSchema,
	pagedVideosSchema,
} from '@/features/admin/schemas/video.schema';

type Video = z.infer<typeof videoSchema>;
type PagedVideos = z.infer<typeof pagedVideosSchema>;

export type { Video, PagedVideos };
