import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CourseDetailLocked } from '@/features/catalog/components/course-detail-locked';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseDetails } from '@/features/catalog/model/course-details';

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

test('renders the certificate benefit line only when the course issues one', () => {
	const withCertificate = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ certificateIssued: true }),
			areaName: null,
		}),
	);
	const withoutCertificate = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ certificateIssued: false }),
			areaName: null,
		}),
	);

	assert.match(withCertificate, /Certificado ao concluir 100%/);
	assert.doesNotMatch(withoutCertificate, /Certificado ao concluir 100%/);
	assert.match(withoutCertificate, /Acesso vitalício ao conteúdo/);
});

test('shows "Carregando conteúdo…" when details have not loaded yet', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({}),
			areaName: null,
		}),
	);

	assert.match(html, /Carregando conteúdo…/);
});

test('renders one preview card per module once details load', () => {
	const details: CourseDetails = {
		id: 'course-1',
		title: 'Escola de Líderes',
		slug: 'escola-de-lideres',
		description: '',
		thumbnailUrl: null,
		pricingModel: 'Paid',
		priceAmount: 149,
		hasAccess: false,
		certificateIssued: true,
		areaIds: [],
		modules: [
			{
				id: 'module-1',
				title: 'Chamado e caráter',
				description: '',
				displayOrder: 1,
				published: true,
				lessons: [
					{
						id: 'l1',
						title: 'O caráter do líder',
						description: '',
						displayOrder: 1,
						freePreview: true,
						published: true,
						videoId: 'v1',
						durationSeconds: 4800,
					},
				],
			},
			{
				id: 'module-2',
				title: 'Doutrina essencial',
				description: '',
				displayOrder: 2,
				published: true,
				lessons: [
					{
						id: 'l2',
						title: 'Fundamentos da fé',
						description: '',
						displayOrder: 1,
						freePreview: false,
						published: true,
						videoId: null,
						durationSeconds: null,
					},
				],
			},
		],
	};

	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({}),
			areaName: null,
			details,
		}),
	);

	assert.match(html, /Chamado e caráter/);
	assert.match(html, /Doutrina essencial/);
	assert.match(html, /Assistir aula grátis/);
	assert.match(html, /Bloqueado/);
});
