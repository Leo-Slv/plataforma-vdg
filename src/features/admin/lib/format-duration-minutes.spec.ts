import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatDurationMinutes } from '@/features/admin/lib/format-duration-minutes';

test('returns "sem vídeo" for null', () => {
	assert.equal(formatDurationMinutes(null), 'sem vídeo');
});

test('formats seconds as whole minutes, rounded down', () => {
	assert.equal(formatDurationMinutes(720), '12min · vídeo pronto');
	assert.equal(formatDurationMinutes(1080), '18min · vídeo pronto');
	assert.equal(formatDurationMinutes(719), '11min · vídeo pronto');
});

test('formats zero seconds', () => {
	assert.equal(formatDurationMinutes(0), '0min · vídeo pronto');
});
