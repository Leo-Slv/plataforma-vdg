import { z } from 'zod';

const imageUploadUrlSchema = z.object({
	storageProvider: z.string(),
	storageKey: z.string(),
	uploadUrl: z.string(),
	publicUrl: z.string(),
	expiresAt: z.string(),
});

export { imageUploadUrlSchema };
