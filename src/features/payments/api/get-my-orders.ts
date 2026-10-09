import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { orderSchema } from '@/features/payments/schemas/order.schema';
import type { Order } from '@/features/payments/model/order';

async function getMyOrders(): Promise<Order[]> {
	const data = await apiFetch('/api/orders/me');
	return z.array(orderSchema).parse(data);
}

export { getMyOrders };
