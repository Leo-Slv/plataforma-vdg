import { z } from 'zod';

const uploadUrlSchema = z.object({
	storageProvider: z.string(),
	storageKey: z.string(),
	uploadUrl: z.string(),
	expiresAt: z.string(),
});

export { uploadUrlSchema };
