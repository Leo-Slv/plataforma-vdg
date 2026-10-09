import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resetPasswordFormSchema } from '@/features/auth/schemas/reset-password-form.schema';

const valid = {
	token: 'abc123',
	newPassword: 'a-long-enough-password',
	confirmPassword: 'a-long-enough-password',
};

test('accepts a token with a matching password of at least 12 characters', () => {
	assert.equal(resetPasswordFormSchema.safeParse(valid).success, true);
});

test('requires the reset code', () => {
	assert.equal(
		resetPasswordFormSchema.safeParse({ ...valid, token: '  ' }).success,
		false,
	);
});

test('rejects a password shorter than 12 characters', () => {
	assert.equal(
		resetPasswordFormSchema.safeParse({
			...valid,
			newPassword: 'short',
			confirmPassword: 'short',
		}).success,
		false,
	);
});

test('rejects mismatching confirmation and reports it on the confirmation field', () => {
	const result = resetPasswordFormSchema.safeParse({
		...valid,
		confirmPassword: 'something-different-1',
	});

	assert.equal(result.success, false);
	assert.deepEqual(result.error?.issues[0].path, ['confirmPassword']);
});
