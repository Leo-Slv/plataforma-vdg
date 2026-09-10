import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TestimonialsTable } from '@/features/admin/components/testimonials-table';
import type { Testimonial } from '@/features/admin/model/testimonial';
import type { Course } from '@/features/admin/model/course';

function buildTestimonial(overrides: Partial<Testimonial>): Testimonial {
	return {
		id: 'testimonial-1',
		authorName: 'Ana Beatriz Souza',
		quote: 'Esse curso mudou completamente minha fé.',
		avatarUrl: null,
		courseId: 'course-1',
		published: false,
		submittedByUserId: 'user-1',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z',
		...overrides,
	};
}

function buildCourse(overrides: Partial<Course>): Course {
	return {
		id: 'course-1',
		title: 'Fundamentos da Fé',
		slug: 'fundamentos-da-fe',
		description: '',
		thumbnailUrl: null,
		published: true,
		displayOrder: 0,
		publishedAt: null,
		pricingModel: 'Free',
		priceAmount: null,
		issuesCertificate: true,
		isFeatured: false,
		areaIds: [],
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
		...overrides,
	};
}

const noop = () => {};

test('renders "Nenhum depoimento encontrado." when there are none', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialsTable, {
			testimonials: [],
			courses: [],
			pendingId: null,
			onPublish: noop,
			onUnpublish: noop,
		}),
	);
	assert.match(html, /Nenhum depoimento encontrado\./);
});

test('renders the author, quote, course title, and a "Publicar" action for a pending testimonial', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialsTable, {
			testimonials: [buildTestimonial({ published: false })],
			courses: [buildCourse({})],
			pendingId: null,
			onPublish: noop,
			onUnpublish: noop,
		}),
	);
	assert.match(html, /Ana Beatriz Souza/);
	assert.match(html, /Fundamentos da Fé/);
	assert.match(html, /Esse curso mudou completamente minha fé\./);
	assert.match(html, /Pendente/);
	assert.match(html, />Publicar</);
	assert.doesNotMatch(html, /Despublicar/);
});

test('renders "Despublicar" and a relative time for a published testimonial', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialsTable, {
			testimonials: [buildTestimonial({ published: true })],
			courses: [buildCourse({})],
			pendingId: null,
			onPublish: noop,
			onUnpublish: noop,
		}),
	);
	assert.match(html, /Publicado/);
	assert.match(html, /Despublicar/);
	assert.doesNotMatch(html, />Publicar</);
});

test('renders an em dash when the testimonial has no linked course', () => {
	const html = renderToStaticMarkup(
		createElement(TestimonialsTable, {
			testimonials: [buildTestimonial({ courseId: null })],
			courses: [],
			pendingId: null,
			onPublish: noop,
			onUnpublish: noop,
		}),
	);
	assert.match(html, /—/);
});
