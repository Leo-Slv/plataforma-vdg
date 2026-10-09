import { test } from 'node:test';
import assert from 'node:assert/strict';

import { deriveCheckoutView } from '@/features/payments/lib/checkout-view';
import type { Order } from '@/features/payments/model/order';

function order(overrides: Partial<Order>): Order {
	return {
		id: 'order-1',
		courseId: 'course-1',
		amountInCents: 4990,
		currency: 'brl',
		status: 'Pending',
		paidAt: null,
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

const base = {
	orderId: 'order-1',
	orders: [order({})],
	isLoading: false,
	hasError: false,
	timedOut: false,
};

test('shows not-found when the redirect carries no order id', () => {
	assert.equal(deriveCheckoutView({ ...base, orderId: null }), 'not-found');
});

test('shows loading until the orders arrive', () => {
	assert.equal(
		deriveCheckoutView({ ...base, orders: undefined, isLoading: true }),
		'loading',
	);
});

test('shows confirming while the order is pending and the wait has not timed out', () => {
	assert.equal(deriveCheckoutView(base), 'confirming');
});

test('shows delayed once a pending order exceeds the polling timeout', () => {
	assert.equal(deriveCheckoutView({ ...base, timedOut: true }), 'delayed');
});

test('shows paid only when the API reports the order as Paid', () => {
	assert.equal(
		deriveCheckoutView({ ...base, orders: [order({ status: 'Paid' })] }),
		'paid',
	);
});

test('shows not-paid for expired and failed orders', () => {
	assert.equal(
		deriveCheckoutView({ ...base, orders: [order({ status: 'Expired' })] }),
		'not-paid',
	);
	assert.equal(
		deriveCheckoutView({ ...base, orders: [order({ status: 'Failed' })] }),
		'not-paid',
	);
});

test('shows not-found for an id that is not among the user orders', () => {
	assert.equal(
		deriveCheckoutView({ ...base, orders: [order({ id: 'other' })] }),
		'not-found',
	);
});

test('shows delayed when the orders request failed', () => {
	assert.equal(
		deriveCheckoutView({ ...base, orders: undefined, hasError: true }),
		'delayed',
	);
});
