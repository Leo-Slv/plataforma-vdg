import type { z } from 'zod';

import type { checkoutSchema } from '@/features/payments/schemas/checkout.schema';
import type { orderSchema } from '@/features/payments/schemas/order.schema';

type Order = z.infer<typeof orderSchema>;
type Checkout = z.infer<typeof checkoutSchema>;

export type { Order, Checkout };
