import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatDuration } from '@/features/catalog/lib/format-duration';

test('formats whole hours without minutes', () => {
	assert.equal(formatDuration(3600), '1h');
	assert.equal(formatDuration(43200), '12h');
});

test('formats hours and minutes', () => {
	assert.equal(formatDuration(4800), '1h 20min');
	assert.equal(formatDuration(9000), '2h 30min');
});

test('formats under an hour as minutes only', () => {
	assert.equal(formatDuration(1200), '20min');
});
