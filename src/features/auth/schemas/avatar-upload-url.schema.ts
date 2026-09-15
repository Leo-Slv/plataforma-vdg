import { z } from 'zod';

const avatarUploadUrlSchema = z.object({
	storageProvider: z.string(),
	storageKey: z.string(),
	uploadUrl: z.string(),
	expiresAt: z.string(),
});

export { avatarUploadUrlSchema };
