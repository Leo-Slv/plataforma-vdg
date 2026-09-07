import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolvePriceAmount } from '@/features/admin/lib/resolve-price-amount';

test('returns null for Free regardless of input', () => {
	assert.equal(resolvePriceAmount('Free', '149'), null);
	assert.equal(resolvePriceAmount('Free', ''), null);
});

test('returns null for EnrollmentControlled regardless of input', () => {
	assert.equal(resolvePriceAmount('EnrollmentControlled', '149'), null);
});

test('parses a valid numeric string for Paid', () => {
	assert.equal(resolvePriceAmount('Paid', '149'), 149);
	assert.equal(resolvePriceAmount('Paid', '149.5'), 149.5);
});
