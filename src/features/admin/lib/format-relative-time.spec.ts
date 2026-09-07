import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatRelativeTime } from '@/features/admin/lib/format-relative-time';

const NOW = new Date('2026-09-07T18:00:00Z');

test('formats under a minute as at least 1min', () => {
	assert.equal(formatRelativeTime('2026-09-07T17:59:50Z', NOW), 'há 1min');
});

test('formats minutes under an hour', () => {
	assert.equal(formatRelativeTime('2026-09-07T17:45:00Z', NOW), 'há 15min');
});

test('formats hours under a day', () => {
	assert.equal(formatRelativeTime('2026-09-07T16:00:00Z', NOW), 'há 2h');
});

test('formats exactly 23h59m as hours, not "ontem"', () => {
	assert.equal(formatRelativeTime('2026-09-06T18:01:00Z', NOW), 'há 23h');
});

test('formats between 24h and 48h as "ontem"', () => {
	assert.equal(formatRelativeTime('2026-09-06T10:00:00Z', NOW), 'ontem');
});

test('formats beyond 48h as an absolute date', () => {
	assert.equal(
		formatRelativeTime('2026-09-01T10:00:00Z', NOW),
		new Date('2026-09-01T10:00:00Z').toLocaleDateString('pt-BR'),
	);
});
