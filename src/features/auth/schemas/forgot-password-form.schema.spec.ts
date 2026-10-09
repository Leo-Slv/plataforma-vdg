import { test } from 'node:test';
import assert from 'node:assert/strict';

import { forgotPasswordFormSchema } from '@/features/auth/schemas/forgot-password-form.schema';

test('accepts a valid e-mail and trims it', () => {
	const result = forgotPasswordFormSchema.safeParse({
		email: '  ana@example.com ',
		captchaToken: '',
	});

	assert.equal(result.success, true);
	assert.equal(result.data?.email, 'ana@example.com');
});

test('rejects an empty or malformed e-mail', () => {
	assert.equal(
		forgotPasswordFormSchema.safeParse({ email: '', captchaToken: '' }).success,
		false,
	);
	assert.equal(
		forgotPasswordFormSchema.safeParse({
			email: 'not-an-email',
			captchaToken: '',
		}).success,
		false,
	);
});
