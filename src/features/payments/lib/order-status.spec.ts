import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	isSettledOrderStatus,
	orderStatusView,
} from '@/features/payments/lib/order-status';

test('maps known statuses to a label and tone', () => {
	assert.deepEqual(orderStatusView('Paid'), { label: 'Pago', tone: 'success' });
	assert.deepEqual(orderStatusView('Pending'), {
		label: 'Aguardando pagamento',
		tone: 'pending',
	});
	assert.equal(orderStatusView('Failed').tone, 'danger');
	assert.equal(orderStatusView('Expired').tone, 'neutral');
});

test('falls back to the raw status for an unknown value', () => {
	assert.deepEqual(orderStatusView('Refunded'), {
		label: 'Refunded',
		tone: 'neutral',
	});
});

test('only Pending is unsettled', () => {
	assert.equal(isSettledOrderStatus('Pending'), false);
	assert.equal(isSettledOrderStatus('Paid'), true);
	assert.equal(isSettledOrderStatus('Expired'), true);
	assert.equal(isSettledOrderStatus('Failed'), true);
});
