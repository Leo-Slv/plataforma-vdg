import type { z } from 'zod';

import type { imageUploadUrlSchema } from '@/features/admin/schemas/image-upload-url.schema';

type ImageUploadUrl = z.infer<typeof imageUploadUrlSchema>;

export type { ImageUploadUrl };
