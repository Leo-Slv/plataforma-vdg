import { z } from 'zod';

const lessonSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	displayOrder: z.number(),
	freePreview: z.boolean(),
	published: z.boolean(),
});

const courseModuleSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	displayOrder: z.number(),
	published: z.boolean(),
	lessons: z.array(lessonSchema),
});

const courseDetailsSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	thumbnailUrl: z.string().nullable(),
	pricingModel: z.enum(['Free', 'Paid']),
	areaIds: z.array(z.string()),
	modules: z.array(courseModuleSchema),
});

export { lessonSchema, courseModuleSchema, courseDetailsSchema };
