import { test } from 'node:test';
import assert from 'node:assert/strict';

import { passwordStrengthSegments } from '@/features/auth/lib/password-strength';

test('0 segments under 12 characters', () => {
	assert.equal(passwordStrengthSegments('a'.repeat(11)), 0);
});

test('1 segment from 12 to 15 characters', () => {
	assert.equal(passwordStrengthSegments('a'.repeat(12)), 1);
	assert.equal(passwordStrengthSegments('a'.repeat(15)), 1);
});

test('2 segments from 16 to 19 characters', () => {
	assert.equal(passwordStrengthSegments('a'.repeat(16)), 2);
	assert.equal(passwordStrengthSegments('a'.repeat(19)), 2);
});

test('3 segments from 20 to 23 characters', () => {
	assert.equal(passwordStrengthSegments('a'.repeat(20)), 3);
	assert.equal(passwordStrengthSegments('a'.repeat(23)), 3);
});

test('4 segments at 24 characters and above', () => {
	assert.equal(passwordStrengthSegments('a'.repeat(24)), 4);
	assert.equal(passwordStrengthSegments('a'.repeat(40)), 4);
});
