import { test } from 'node:test';
import assert from 'node:assert/strict';

import { postLoginDestination } from '@/features/auth/lib/post-login-destination';

test('sends an unconfirmed account to the e-mail confirmation screen', () => {
	assert.equal(postLoginDestination(null), '/confirm-email');
});

test('sends a confirmed account to the catalog', () => {
	assert.equal(postLoginDestination('2026-10-01T10:00:00.000Z'), '/catalog');
});

test('falls back to the catalog when the account state is unknown', () => {
	assert.equal(postLoginDestination(undefined), '/catalog');
});
