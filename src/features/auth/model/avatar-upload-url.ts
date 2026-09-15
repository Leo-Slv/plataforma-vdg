import type { z } from 'zod';

import type { avatarUploadUrlSchema } from '@/features/auth/schemas/avatar-upload-url.schema';

type AvatarUploadUrl = z.infer<typeof avatarUploadUrlSchema>;

export type { AvatarUploadUrl };
