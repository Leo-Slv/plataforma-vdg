import { test } from 'node:test';
import assert from 'node:assert/strict';

import { loginFormSchema } from '@/features/auth/schemas/login-form.schema';

test('accepts a valid payload', () => {
	const result = loginFormSchema.safeParse({
		email: 'ana.souza@email.com',
		password: 'short',
	});
	assert.equal(result.success, true);
});

test('a password under 12 characters still passes (no creation rule on login)', () => {
	const result = loginFormSchema.safeParse({
		email: 'ana.souza@email.com',
		password: 'a',
	});
	assert.equal(result.success, true);
});

test('rejects an empty email', () => {
	const result = loginFormSchema.safeParse({ email: '', password: 'anything' });
	assert.equal(result.success, false);
});

test('rejects an invalid email', () => {
	const result = loginFormSchema.safeParse({
		email: 'not-an-email',
		password: 'anything',
	});
	assert.equal(result.success, false);
});

test('rejects an empty password', () => {
	const result = loginFormSchema.safeParse({
		email: 'ana.souza@email.com',
		password: '',
	});
	assert.equal(result.success, false);
});
