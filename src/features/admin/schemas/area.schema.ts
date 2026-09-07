import { z } from 'zod';

const areaCourseSummarySchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	published: z.boolean(),
});

const areaSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string(),
	active: z.boolean(),
	displayOrder: z.number(),
	accentColor: z.string(),
	courseCount: z.number(),
	courses: z.array(areaCourseSummarySchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export { areaSchema };
