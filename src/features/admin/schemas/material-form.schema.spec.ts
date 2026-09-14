import { test } from 'node:test';
import assert from 'node:assert/strict';

import { materialFormSchema } from '@/features/admin/schemas/material-form.schema';

const VALID_FILE = new File(['x'], 'apostila.pdf', { type: 'application/pdf' });

test('accepts a title with a file selected', () => {
	const result = materialFormSchema.safeParse({
		title: 'Apostila — Módulo 01',
		file: VALID_FILE,
	});
	assert.equal(result.success, true);
});

test('rejects an empty title', () => {
	const result = materialFormSchema.safeParse({ title: '', file: VALID_FILE });
	assert.equal(result.success, false);
});

test('rejects a missing file', () => {
	const result = materialFormSchema.safeParse({
		title: 'Apostila',
		file: null,
	});
	assert.equal(result.success, false);
});
