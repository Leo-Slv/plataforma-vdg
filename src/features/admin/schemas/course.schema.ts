import { z } from 'zod';

const courseSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	thumbnailUrl: z.string().nullable(),
	published: z.boolean(),
	displayOrder: z.number(),
	publishedAt: z.string().nullable(),
	pricingModel: z.enum(['Free', 'Paid', 'EnrollmentControlled']),
	priceAmount: z.number().nullable(),
	issuesCertificate: z.boolean(),
	isFeatured: z.boolean(),
	areaIds: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export { courseSchema };
