import { test } from 'node:test';
import assert from 'node:assert/strict';

import { registerFormSchema } from '@/features/auth/schemas/register-form.schema';

const validPayload = {
	name: 'Ana Beatriz Souza',
	email: 'ana.souza@email.com',
	password: 'senha-com-mais-de-12-caracteres',
	captchaToken: 'token',
};

test('accepts a valid payload', () => {
	const result = registerFormSchema.safeParse(validPayload);
	assert.equal(result.success, true);
});

test('rejects an empty name', () => {
	const result = registerFormSchema.safeParse({ ...validPayload, name: '  ' });
	assert.equal(result.success, false);
});

test('rejects a name over 200 characters', () => {
	const result = registerFormSchema.safeParse({
		...validPayload,
		name: 'a'.repeat(201),
	});
	assert.equal(result.success, false);
});

test('rejects an invalid email', () => {
	const result = registerFormSchema.safeParse({
		...validPayload,
		email: 'not-an-email',
	});
	assert.equal(result.success, false);
});

test('rejects an email over 320 characters', () => {
	const longEmail = `${'a'.repeat(315)}@example.com`;
	assert.ok(longEmail.length > 320);
	const result = registerFormSchema.safeParse({
		...validPayload,
		email: longEmail,
	});
	assert.equal(result.success, false);
});

test('rejects a password under 12 characters', () => {
	const result = registerFormSchema.safeParse({
		...validPayload,
		password: 'short123456',
	});
	assert.equal(result.success, false);
	if (!result.success) {
		assert.equal(result.error.issues[0]?.message, 'Mínimo de 12 caracteres.');
	}
});
