import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TestimonialQuoteField } from '@/features/testimonials/components/testimonial-quote-field';

test('renders the label and no error text by default', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialQuoteField, {
			label: 'Seu depoimento',
			name: 'quote',
		}),
	);

	assert.match(html, /Seu depoimento/);
	assert.doesNotMatch(html, /<p/);
});

test('renders the error message when provided', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialQuoteField, {
			label: 'Seu depoimento',
			name: 'quote',
			error: 'Escreva seu depoimento.',
		}),
	);

	assert.match(html, /Escreva seu depoimento\./);
	assert.match(html, /aria-invalid="true"/);
});
