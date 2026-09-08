import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	formatCurrencyBrl,
	formatCurrencyBrlWithCents,
} from '@/features/catalog/lib/format-currency-brl';

test('formatCurrencyBrl formats whole numbers without cents', () => {
	assert.match(formatCurrencyBrl(149), /R\$\s?149/);
});

test('formatCurrencyBrlWithCents always shows two decimal places', () => {
	assert.match(formatCurrencyBrlWithCents(149 / 3), /R\$\s?49,67/);
	assert.match(formatCurrencyBrlWithCents(50), /R\$\s?50,00/);
});
