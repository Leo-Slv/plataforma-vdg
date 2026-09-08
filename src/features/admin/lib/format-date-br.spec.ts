import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatDateBr } from '@/features/admin/lib/format-date-br';

test('formats an ISO date as DD/MM/AAAA', () => {
	assert.equal(formatDateBr('2026-01-12T10:00:00.000Z'), '12/01/2026');
});

test('formats a different month/day correctly', () => {
	assert.equal(formatDateBr('2026-11-03T12:00:00.000Z'), '03/11/2026');
});
