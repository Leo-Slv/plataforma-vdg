import { z } from 'zod';

const lessonMaterialSchema = z.object({
	id: z.string(),
	title: z.string(),
	fileName: z.string(),
	contentType: z.string(),
	sizeBytes: z.number(),
	displayOrder: z.number(),
});

export { lessonMaterialSchema };
