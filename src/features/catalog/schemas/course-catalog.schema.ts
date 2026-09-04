import { z } from 'zod';

const areaSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	displayOrder: z.number(),
});

const courseCatalogItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	thumbnailUrl: z.string().nullable(),
	displayOrder: z.number(),
	pricingModel: z.enum(['Free', 'Paid']),
	areaIds: z.array(z.string()),
	hasAccess: z.boolean(),
});

const courseCatalogSchema = z.object({
	areas: z.array(areaSummarySchema),
	courses: z.array(courseCatalogItemSchema),
});

export { areaSummarySchema, courseCatalogItemSchema, courseCatalogSchema };
