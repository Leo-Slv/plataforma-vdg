import { test } from 'node:test';
import assert from 'node:assert/strict';

import { firstName } from '@/features/visitors/lib/first-name';

test('returns a single-word name as is', () => {
	assert.equal(firstName('Ana'), 'Ana');
});

test('returns the first word of a full name', () => {
	assert.equal(firstName('Ana Lima Souza'), 'Ana');
});

test('ignores surrounding and repeated whitespace', () => {
	assert.equal(firstName('   Ana    Lima  '), 'Ana');
});
