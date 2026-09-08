import type { z } from 'zod';

import type { videoSchema } from '@/features/admin/schemas/video.schema';

type Video = z.infer<typeof videoSchema>;

export type { Video };
