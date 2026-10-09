import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '@/lib/http/api-error';
import {
	checkoutErrorMessage,
	GENERIC_CHECKOUT_ERROR,
} from '@/features/payments/lib/checkout-error';

test('maps each documented checkout status to a specific message', () => {
	assert.match(
		checkoutErrorMessage(new ApiError('x', 403)),
		/Confirme seu e-mail/,
	);
	assert.match(
		checkoutErrorMessage(new ApiError('x', 404)),
		/não está disponível/,
	);
	assert.match(checkoutErrorMessage(new ApiError('x', 409)), /já tem acesso/);
	assert.match(checkoutErrorMessage(new ApiError('x', 502)), /indisponível/);
});

test('falls back to a generic message for other errors', () => {
	assert.equal(
		checkoutErrorMessage(new ApiError('x', 500)),
		GENERIC_CHECKOUT_ERROR,
	);
	assert.equal(
		checkoutErrorMessage(new Error('network')),
		GENERIC_CHECKOUT_ERROR,
	);
});
