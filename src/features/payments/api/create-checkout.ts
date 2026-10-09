import { apiFetch } from '@/lib/http/api-client';
import { checkoutSchema } from '@/features/payments/schemas/checkout.schema';
import type { Checkout } from '@/features/payments/model/order';

async function createCheckout(courseId: string): Promise<Checkout> {
	const data = await apiFetch(`/api/courses/${courseId}/checkout`, {
		method: 'POST',
	});
	return checkoutSchema.parse(data);
}

export { createCheckout };
