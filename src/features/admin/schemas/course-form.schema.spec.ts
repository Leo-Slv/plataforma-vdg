import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	courseFormSchema,
	type CourseFormValues,
} from '@/features/admin/schemas/course-form.schema';

const valid: CourseFormValues = {
	title: 'Escola de Líderes',
	description: '8 módulos, mentoria em grupo.',
	thumbnailUrl: '',
	pricingModel: 'Free',
	priceAmount: '',
	areaId: 'area-1',
	displayOrder: 1,
	issuesCertificate: true,
	isFeatured: false,
	published: true,
};

function messages(values: CourseFormValues) {
	const result = courseFormSchema.safeParse(values);
	return result.success
		? []
		: result.error.issues.map((issue) => issue.message);
}

test('accepts a course with a description', () => {
	assert.deepEqual(messages(valid), []);
});

test('requires a description, matching the API rule', () => {
	assert.deepEqual(messages({ ...valid, description: '' }), [
		'Informe a descrição do curso.',
	]);
});

test('a description with only spaces counts as empty', () => {
	assert.deepEqual(messages({ ...valid, description: '   ' }), [
		'Informe a descrição do curso.',
	]);
});

test('rejects a description above the API limit of 2000 characters', () => {
	assert.deepEqual(messages({ ...valid, description: 'a'.repeat(2001) }), [
		'A descrição pode ter no máximo 2000 caracteres.',
	]);
	assert.deepEqual(messages({ ...valid, description: 'a'.repeat(2000) }), []);
});
