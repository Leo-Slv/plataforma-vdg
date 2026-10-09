import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	nextPollDelay,
	POLL_INTERVAL_MS,
	POLL_TIMEOUT_MS,
} from '@/features/payments/lib/poll-order';
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

test('keeps polling while the order is pending', () => {
	assert.equal(nextPollDelay([order({})], 'order-1', 1000), POLL_INTERVAL_MS);
});

test('keeps polling before the first response arrives or while the order is missing', () => {
	assert.equal(nextPollDelay(undefined, 'order-1', 0), POLL_INTERVAL_MS);
	assert.equal(nextPollDelay([], 'order-1', 0), POLL_INTERVAL_MS);
});

test('stops once the order is settled', () => {
	assert.equal(
		nextPollDelay([order({ status: 'Paid' })], 'order-1', 1000),
		false,
	);
	assert.equal(
		nextPollDelay([order({ status: 'Expired' })], 'order-1', 1000),
		false,
	);
});

test('stops at the timeout even if still pending', () => {
	assert.equal(nextPollDelay([order({})], 'order-1', POLL_TIMEOUT_MS), false);
});
