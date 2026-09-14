import { z } from 'zod';

const materialDownloadSchema = z.object({
	downloadUrl: z.string(),
});

export { materialDownloadSchema };
