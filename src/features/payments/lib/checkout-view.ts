import type { Order } from '@/features/payments/model/order';

type CheckoutView =
	'loading' | 'confirming' | 'paid' | 'delayed' | 'not-paid' | 'not-found';

type DeriveCheckoutViewInput = {
	orderId: string | null;
	orders: Order[] | undefined;
	isLoading: boolean;
	hasError: boolean;
	timedOut: boolean;
};

/**
 * Decides what the post-checkout screen shows. Access is granted by the
 * Stripe webhook, not by the redirect, so "paid" is only ever derived from
 * the order the API reports.
 */
function deriveCheckoutView({
	orderId,
	orders,
	isLoading,
	hasError,
	timedOut,
}: DeriveCheckoutViewInput): CheckoutView {
	if (!orderId) {
		return 'not-found';
	}

	if (isLoading) {
		return 'loading';
	}

	const order = orders?.find((candidate) => candidate.id === orderId);

	if (!order) {
		return hasError ? 'delayed' : 'not-found';
	}

	if (order.status === 'Paid') {
		return 'paid';
	}

	if (order.status === 'Pending') {
		return timedOut ? 'delayed' : 'confirming';
	}

	return 'not-paid';
}

export { deriveCheckoutView };
export type { CheckoutView, DeriveCheckoutViewInput };
