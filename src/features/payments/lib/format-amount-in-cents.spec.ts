import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatAmountInCents } from '@/features/payments/lib/format-amount-in-cents';

test('formats cents as BRL', () => {
	assert.match(formatAmountInCents(4990), /R\$\s?49,90/);
	assert.match(formatAmountInCents(100000), /R\$\s?1\.000,00/);
});

test('accepts a lowercase currency code from the API', () => {
	assert.match(formatAmountInCents(500, 'brl'), /R\$\s?5,00/);
});
