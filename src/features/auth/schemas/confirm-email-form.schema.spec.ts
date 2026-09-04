import { test } from 'node:test';
import assert from 'node:assert/strict';

import { confirmEmailFormSchema } from '@/features/auth/schemas/confirm-email-form.schema';

test('accepts a non-empty token', () => {
	const result = confirmEmailFormSchema.safeParse({ token: 'xK9f2LpQr7' });
	assert.equal(result.success, true);
});

test('rejects an empty token', () => {
	const result = confirmEmailFormSchema.safeParse({ token: '' });
	assert.equal(result.success, false);
});

test('rejects a whitespace-only token', () => {
	const result = confirmEmailFormSchema.safeParse({ token: '   ' });
	assert.equal(result.success, false);
});
