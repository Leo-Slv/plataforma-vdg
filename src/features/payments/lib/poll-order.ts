import { isSettledOrderStatus } from '@/features/payments/lib/order-status';
import type { Order } from '@/features/payments/model/order';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

/**
 * After Stripe redirects back, the webhook that actually grants access may
 * land a moment later. Keep polling until the order leaves "Pending" or the
 * timeout is reached.
 */
function nextPollDelay(
	orders: Order[] | undefined,
	orderId: string,
	elapsedMs: number,
): number | false {
	if (elapsedMs >= POLL_TIMEOUT_MS) {
		return false;
	}

	const order = orders?.find((candidate) => candidate.id === orderId);

	if (order && isSettledOrderStatus(order.status)) {
		return false;
	}

	return POLL_INTERVAL_MS;
}

export { nextPollDelay, POLL_INTERVAL_MS, POLL_TIMEOUT_MS };
