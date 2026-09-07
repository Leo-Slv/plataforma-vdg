import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatCurrencyBrl } from '@/features/admin/lib/format-currency-brl';

test('formatCurrencyBrl formats whole numbers without cents', () => {
	assert.match(formatCurrencyBrl(149), /R\$\s?149/);
	assert.match(formatCurrencyBrl(89), /R\$\s?89/);
	assert.match(formatCurrencyBrl(199), /R\$\s?199/);
});

test('formatCurrencyBrl rounds fractional amounts to the nearest whole number', () => {
	assert.match(formatCurrencyBrl(149.6), /R\$\s?150/);
});

test('formatCurrencyBrl formats zero', () => {
	assert.match(formatCurrencyBrl(0), /R\$\s?0/);
});
