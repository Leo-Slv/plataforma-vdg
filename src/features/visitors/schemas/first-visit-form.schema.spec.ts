import { test } from 'node:test';
import assert from 'node:assert/strict';

import { firstVisitFormSchema } from '@/features/visitors/schemas/first-visit-form.schema';
import { ADDRESS_TOO_LONG_MESSAGE } from '@/features/visitors/lib/first-visit-messages';

const valid = {
	name: 'Ana Lima',
	phone: '(11) 98765-4321',
	email: 'ana@example.com',
	address: 'Rua A, 10, Centro, São Paulo',
	captchaToken: '',
};

function failingPaths(values: Record<string, unknown>) {
	const result = firstVisitFormSchema.safeParse(values);
	assert.equal(result.success, false);
	return result.error!.issues.map((issue) => issue.path.join('.'));
}

test('accepts a valid payload with and without an address', () => {
	assert.equal(firstVisitFormSchema.safeParse(valid).success, true);
	assert.equal(
		firstVisitFormSchema.safeParse({ ...valid, address: '' }).success,
		true,
	);
});

test('accepts masked and digits-only phones, landline or mobile', () => {
	for (const phone of ['(11) 98765-4321', '11987654321', '(11) 3456-7890']) {
		assert.equal(
			firstVisitFormSchema.safeParse({ ...valid, phone }).success,
			true,
			phone,
		);
	}
});

test('rejects a name with fewer than 2 characters after trimming', () => {
	assert.deepEqual(failingPaths({ ...valid, name: ' A ' }), ['name']);
});

test('rejects phones without 10 or 11 digits', () => {
	assert.deepEqual(failingPaths({ ...valid, phone: '(11) 8765-432' }), [
		'phone',
	]);
	assert.deepEqual(failingPaths({ ...valid, phone: '+55 (11) 98765-4321' }), [
		'phone',
	]);
});

test('rejects an invalid e-mail', () => {
	assert.deepEqual(failingPaths({ ...valid, email: 'not-an-email' }), [
		'email',
	]);
});

test('rejects an address over 300 characters with its own message', () => {
	const result = firstVisitFormSchema.safeParse({
		...valid,
		address: 'a'.repeat(301),
	});

	assert.equal(result.success, false);
	assert.equal(result.error!.issues[0]?.message, ADDRESS_TOO_LONG_MESSAGE);
});
