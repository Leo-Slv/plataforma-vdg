import { z } from 'zod';

const publicFeaturedCourseSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	thumbnailUrl: z.string().nullable(),
});

const publicAreaSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	publishedCourseCount: z.number(),
});

const publicCatalogSummarySchema = z.object({
	activeAreaCount: z.number(),
	publishedCourseCount: z.number(),
	featuredCourses: z.array(publicFeaturedCourseSchema),
	highlightedCourse: publicFeaturedCourseSchema.nullable(),
	areas: z.array(publicAreaSummarySchema),
});

export {
	publicFeaturedCourseSchema,
	publicAreaSummarySchema,
	publicCatalogSummarySchema,
};
