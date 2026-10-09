import { z } from 'zod';

const orderSchema = z.object({
	id: z.string(),
	courseId: z.string(),
	amountInCents: z.number(),
	currency: z.string(),
	// 'Pending' | 'Paid' | 'Expired' | 'Failed' — kept as a string so an
	// unknown future status never breaks parsing of the whole list.
	status: z.string(),
	paidAt: z.string().nullable(),
	createdAt: z.string(),
});

export { orderSchema };
