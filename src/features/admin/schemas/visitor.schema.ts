import { z } from 'zod';

const visitorSchema = z.object({
	id: z.string(),
	name: z.string(),
	phone: z.string(),
	email: z.string(),
	address: z.string().nullable(),
	submittedAt: z.string(),
	contacted: z.boolean(),
	contactedAt: z.string().nullable(),
});

const pagedVisitorsSchema = z.object({
	items: z.array(visitorSchema),
	page: z.number(),
	pageSize: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

export { visitorSchema, pagedVisitorsSchema };
