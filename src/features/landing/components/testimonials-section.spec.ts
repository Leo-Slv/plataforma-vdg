import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TestimonialsSection } from '@/features/landing/components/testimonials-section';
import type { Testimonial } from '@/features/landing/model/testimonial';

function buildTestimonial(overrides: Partial<Testimonial>): Testimonial {
	return {
		id: 'testimonial-1',
		authorName: 'Marina Souza',
		quote: 'O curso me ajudou muito.',
		avatarUrl: null,
		courseId: null,
		published: true,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

test('renders each testimonial quote and author', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialsSection, {
			testimonials: [
				buildTestimonial({ id: 'a', authorName: 'Marina Souza' }),
				buildTestimonial({ id: 'b', authorName: 'Carlos Andrade' }),
			],
		}),
	);
	assert.match(html, /Marina Souza/);
	assert.match(html, /Carlos Andrade/);
});

test('falls back to the brand mark image when avatarUrl is null', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialsSection, {
			testimonials: [buildTestimonial({ avatarUrl: null })],
		}),
	);
	assert.match(html, /viver-da-graca-mark\.png/);
});
