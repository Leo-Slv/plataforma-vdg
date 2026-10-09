import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CheckoutResult } from '@/features/payments/components/checkout-result';

test('shows the confirming message while waiting for the webhook', () => {
	const html = renderToStaticMarkup(
		createElement(CheckoutResult, { view: 'confirming' }),
	);
	assert.match(html, /Confirmando seu pagamento/);
	assert.doesNotMatch(html, /Ir para o curso/);
});

test('shows the paid message with the course title and links', () => {
	const html = renderToStaticMarkup(
		createElement(CheckoutResult, {
			view: 'paid',
			courseTitle: 'Escola de Líderes',
			courseHref: '/courses/escola-de-lideres',
		}),
	);
	assert.match(html, /Pagamento confirmado/);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /href="\/courses\/escola-de-lideres"/);
	assert.match(html, /href="\/my-courses"/);
});

test('offers a retry and the orders list when confirmation is delayed', () => {
	const html = renderToStaticMarkup(
		createElement(CheckoutResult, { view: 'delayed', onRetry: () => {} }),
	);
	assert.match(html, /Ainda estamos confirmando/);
	assert.match(html, /Verificar novamente/);
	assert.match(html, /href="\/orders"/);
});

test('explains that an expired or failed order granted nothing', () => {
	const html = renderToStaticMarkup(
		createElement(CheckoutResult, {
			view: 'not-paid',
			courseHref: '/courses/escola-de-lideres',
		}),
	);
	assert.match(html, /Pagamento não concluído/);
	assert.match(html, /Nenhum acesso foi/);
	assert.match(html, /Voltar ao curso/);
});

test('shows a not-found message with links out', () => {
	const html = renderToStaticMarkup(
		createElement(CheckoutResult, { view: 'not-found' }),
	);
	assert.match(html, /Pedido não encontrado/);
	assert.match(html, /href="\/catalog"/);
});
