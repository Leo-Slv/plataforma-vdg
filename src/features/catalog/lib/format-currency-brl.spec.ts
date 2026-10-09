import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';

test('formatCurrencyBrl formats whole numbers without cents', () => {
	assert.match(formatCurrencyBrl(149), /R\$\s?149/);
});

test('formatCurrencyBrl keeps the cents of a fractional price', () => {
	assert.match(formatCurrencyBrl(49.9), /R\$\s?49,90/);
});
