import { test } from 'node:test';
import assert from 'node:assert/strict';

import { submitTestimonialFormSchema } from '@/features/testimonials/schemas/submit-testimonial-form.schema';

test('accepts a non-empty quote', () => {
	const result = submitTestimonialFormSchema.safeParse({
		quote: 'O curso me ajudou muito.',
	});
	assert.equal(result.success, true);
});

test('rejects an empty quote', () => {
	const result = submitTestimonialFormSchema.safeParse({ quote: '' });
	assert.equal(result.success, false);
});

test('rejects a whitespace-only quote', () => {
	const result = submitTestimonialFormSchema.safeParse({ quote: '   ' });
	assert.equal(result.success, false);
});

test('rejects a quote over 1000 characters', () => {
	const result = submitTestimonialFormSchema.safeParse({
		quote: 'a'.repeat(1001),
	});
	assert.equal(result.success, false);
});

test('accepts a quote at exactly 1000 characters', () => {
	const result = submitTestimonialFormSchema.safeParse({
		quote: 'a'.repeat(1000),
	});
	assert.equal(result.success, true);
});
