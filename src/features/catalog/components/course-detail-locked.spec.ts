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

test('renders the price (not "Pago") as the badge and in the price card, without fake installments', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: 149 }),
			areaName: 'Liderança',
		}),
	);

	assert.doesNotMatch(html, />Pago</);
	const priceOccurrences = html.split(/R\$\s?149/).length - 1;
	assert.equal(
		priceOccurrences,
		2,
		'expected the price in the badge and the price card',
	);
	// Stripe charges the full amount at once; no installment line may suggest otherwise.
	assert.doesNotMatch(html, /3×/);
	assert.doesNotMatch(html, /ou \d+×/);
});

test('falls back to a "Pago" badge for a paid course with no priceAmount set', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: null }),
			areaName: 'Liderança',
		}),
	);

	assert.match(html, />Pago</);
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
				imageUrl: null,
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
				imageUrl: null,
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

test('offers "Comprar agora" for a priced paid course when a buy handler is given', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: 149 }),
			areaName: 'Liderança',
			onBuy: () => {},
		}),
	);

	assert.match(html, /Comprar agora/);
	assert.match(html, /Stripe/);
	assert.doesNotMatch(html, /Inscrever-se agora/);
});

test('shows the redirecting label and disables the button while the checkout starts', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: 149 }),
			areaName: 'Liderança',
			onBuy: () => {},
			isBuying: true,
		}),
	);

	assert.match(html, /Redirecionando para o pagamento/);
	assert.match(html, /disabled/);
});

test('shows the checkout error next to the buy button', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: 149 }),
			areaName: 'Liderança',
			onBuy: () => {},
			buyError: 'Confirme seu e-mail para poder comprar este curso.',
		}),
	);

	assert.match(html, /role="alert"/);
	assert.match(html, /Confirme seu e-mail/);
});

test('a locked free course explains it is released by the team, with no dead button', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Free' }),
			areaName: 'Discipulado',
			onBuy: () => {},
		}),
	);

	assert.match(html, /liberado pela equipe/);
	assert.doesNotMatch(html, /Comprar agora/);
	assert.doesNotMatch(html, /Inscrever-se agora/);
	assert.doesNotMatch(html, /<button/);
});

test('an enrollment-controlled course offers "Solicitar acesso"', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({
				pricingModel: 'EnrollmentControlled',
				priceAmount: null,
			}),
			areaName: 'Liderança',
			onRequestAccess: () => {},
		}),
	);

	assert.match(html, /Solicitar acesso/);
	assert.doesNotMatch(html, /Comprar agora/);
	assert.doesNotMatch(html, /Inscrever-se agora/);
});

test('shows a pending request instead of the button', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({
				pricingModel: 'EnrollmentControlled',
				priceAmount: null,
			}),
			areaName: 'Liderança',
			onRequestAccess: () => {},
			requestStatus: 'Pending',
		}),
	);

	assert.match(html, /Solicitação enviada/);
	assert.doesNotMatch(html, /<button/);
});

test('lets the user ask again after a rejected request', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({
				pricingModel: 'EnrollmentControlled',
				priceAmount: null,
			}),
			areaName: 'Liderança',
			onRequestAccess: () => {},
			requestStatus: 'Rejected',
		}),
	);

	assert.match(html, /não foi aprovada/);
	assert.match(html, /Solicitar novamente/);
});

test('shows the sending state and the error of an access request', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({
				pricingModel: 'EnrollmentControlled',
				priceAmount: null,
			}),
			areaName: 'Liderança',
			onRequestAccess: () => {},
			isRequestingAccess: true,
			requestAccessError: 'Não foi possível enviar a solicitação.',
		}),
	);

	assert.match(html, /Enviando solicitação/);
	assert.match(html, /disabled=""/);
	assert.match(html, /role="alert"/);
});

test('an unconfirmed e-mail replaces every action with a link to confirm it', () => {
	for (const overrides of [
		{ pricingModel: 'Paid', priceAmount: 149 },
		{ pricingModel: 'Free', priceAmount: null },
		{ pricingModel: 'EnrollmentControlled', priceAmount: null },
	] as const) {
		const html = renderToStaticMarkup(
			createElement(CourseDetailLocked, {
				course: course(overrides),
				areaName: 'Liderança',
				emailVerified: false,
				onBuy: () => {},
				onRequestAccess: () => {},
			}),
		);

		assert.match(html, /Confirme seu e-mail para liberar este curso/);
		assert.match(html, /href="\/confirm-email"/);
		assert.doesNotMatch(html, /Comprar agora/);
		assert.doesNotMatch(html, /Solicitar acesso/);
	}
});

test('says the preview is unavailable instead of loading forever', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({}),
			areaName: null,
			detailsUnavailable: true,
		}),
	);

	assert.match(html, /prévia do conteúdo não está disponível/);
	assert.doesNotMatch(html, /Carregando conteúdo…/);
});

test('does not offer a purchase for a paid course without a price', () => {
	const html = renderToStaticMarkup(
		createElement(CourseDetailLocked, {
			course: course({ pricingModel: 'Paid', priceAmount: null }),
			areaName: 'Liderança',
			onBuy: () => {},
		}),
	);

	assert.doesNotMatch(html, /Comprar agora/);
});
