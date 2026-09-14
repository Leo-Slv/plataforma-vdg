import type { z } from 'zod';

import type { uploadUrlSchema } from '@/features/admin/schemas/upload-url.schema';

type UploadUrl = z.infer<typeof uploadUrlSchema>;

export type { UploadUrl };
