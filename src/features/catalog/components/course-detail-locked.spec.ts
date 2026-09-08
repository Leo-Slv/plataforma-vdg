import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CourseDetailLocked } from '@/features/catalog/components/course-detail-locked';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';

function course(overrides: Partial<CourseCatalogItem>): CourseCatalogItem {
	return {
		id: 'course-1',
		title: 'Escola de Líderes',
		slug: 'escola-de-lideres',
		description: 'Uma formação de líderes.',
		thumbnailUrl: null,
		displayOrder: 0,
		pricingModel: 'Free',
		priceAmount: null,
		areaIds: ['area-1'],
		hasAccess: false,
		moduleCount: 8,
		lessonCount: 41,
		durationSeconds: 43200,
		certificateIssued: true,
		...overrides,
	};
}

test('renders "Gratuito" for a free course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Free' }),
			areaName: 'Discipulado',
		}),
	);

	assert.match(html, /Gratuito/);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /Discipulado/);
});

test('renders "Pago" badge and the price with installments for a paid course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: 149 }),
			areaName: 'Liderança',
		}),
	);

	assert.match(html, /Pago/);
	assert.match(html, /R\$\s?149/);
	assert.match(html, /3× de/);
	assert.match(html, /R\$\s?49,67/);
});

test('renders no price line for a paid course with no priceAmount set', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: null }),
			areaName: 'Liderança',
		}),
	);

	assert.doesNotMatch(html, /R\$/);
});

test('renders "Por inscrição" for an enrollment-controlled course', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({
				pricingModel: 'EnrollmentControlled',
				priceAmount: null,
			}),
			areaName: 'Liderança',
		}),
	);

	assert.match(html, /Por inscrição/);
});
