import type { z } from 'zod';

import type { videoPlaybackSchema } from '@/features/catalog/schemas/video-playback.schema';

type VideoPlayback = z.infer<typeof videoPlaybackSchema>;

export type { VideoPlayback };
