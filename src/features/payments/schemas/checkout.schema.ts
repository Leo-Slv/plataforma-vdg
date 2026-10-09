import { z } from 'zod';

const checkoutSchema = z.object({
	orderId: z.string(),
	checkoutUrl: z.string().url(),
});

export { checkoutSchema };
