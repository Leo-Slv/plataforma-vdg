import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { OrdersList } from '@/features/payments/components/orders-list';
import type { Order } from '@/features/payments/model/order';

function order(overrides: Partial<Order>): Order {
	return {
		id: 'order-1',
		courseId: 'course-1',
		amountInCents: 4990,
		currency: 'brl',
		status: 'Paid',
		paidAt: '2026-01-02T00:00:00.000Z',
		createdAt: '2026-01-01T12:00:00.000Z',
		...overrides,
	};
}

const courses = {
	'course-1': { title: 'Escola de Líderes', slug: 'escola-de-lideres' },
};

test('shows an empty state with a link to the catalog', () => {
	const html = renderToStaticMarkup(
		createElement(OrdersList, { orders: [], coursesById: {} }),
	);
	assert.match(html, /Você ainda não fez nenhuma compra\./);
	assert.match(html, /href="\/catalog"/);
});

test('renders title (linked), amount and status of each order', () => {
	const html = renderToStaticMarkup(
		createElement(OrdersList, {
			orders: [order({})],
			coursesById: courses,
		}),
	);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /href="\/courses\/escola-de-lideres"/);
	assert.match(html, /R\$\s?49,90/);
	assert.match(html, />Pago</);
});

test('labels pending, expired and failed orders', () => {
	const html = renderToStaticMarkup(
		createElement(OrdersList, {
			orders: [
				order({ id: 'a', status: 'Pending' }),
				order({ id: 'b', status: 'Expired' }),
				order({ id: 'c', status: 'Failed' }),
			],
			coursesById: courses,
		}),
	);
	assert.match(html, /Aguardando pagamento/);
	assert.match(html, />Expirado</);
	assert.match(html, />Falhou</);
});

test('falls back when the course is not in the loaded catalog', () => {
	const html = renderToStaticMarkup(
		createElement(OrdersList, { orders: [order({})], coursesById: {} }),
	);
	assert.match(html, /Curso indisponível/);
});
