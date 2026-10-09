import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VisitorsTable } from '@/features/admin/components/visitors-table';
import type { Visitor } from '@/features/admin/model/visitor';

function visitor(overrides: Partial<Visitor>): Visitor {
	return {
		id: 'visitor-1',
		name: 'Ana Lima',
		phone: '11987654321',
		email: 'ana@example.com',
		address: 'Rua A, 10, Centro',
		submittedAt: '2026-10-01T15:30:00.000Z',
		contacted: false,
		contactedAt: null,
		...overrides,
	};
}

const noop = () => {};

function render(visitors: Visitor[], overrides = {}) {
	return renderToStaticMarkup(
		createElement(VisitorsTable, {
			visitors,
			pendingId: null,
			canToggle: true,
			onToggle: noop,
			...overrides,
		}),
	);
}

test('shows an empty state', () => {
	assert.match(render([]), /Nenhum visitante encontrado\./);
});

test('renders name, e-mail, masked phone and address', () => {
	const html = render([visitor({})]);
	assert.match(html, /Ana Lima/);
	assert.match(html, /ana@example\.com/);
	assert.match(html, /\(11\) 98765-4321/);
	assert.match(html, /Rua A, 10, Centro/);
});

test('falls back to a dash when there is no address', () => {
	assert.match(render([visitor({ address: null })]), />—</);
});

test('renders an unchecked, labelled checkbox for a visitor not yet contacted', () => {
	const html = render([visitor({})]);
	assert.match(html, /type="checkbox"/);
	assert.match(html, /aria-label="Marcar Ana Lima como contatado"/);
	assert.doesNotMatch(html, /checked/);
	assert.doesNotMatch(html, /disabled=""/);
});

test('renders a checked checkbox, strike-through and the contact date once contacted', () => {
	const html = render([
		visitor({ contacted: true, contactedAt: '2026-10-02T12:00:00.000Z' }),
	]);
	assert.match(html, /checked/);
	assert.match(html, /line-through/);
	assert.match(html, /02\/10\/2026|02\/10\/26/);
});

test('disables the checkbox while its own request is pending', () => {
	const html = render([visitor({})], { pendingId: 'visitor-1' });
	assert.match(html, /disabled=""/);
});

test('keeps other rows enabled while one is pending', () => {
	const html = render(
		[visitor({ id: 'a' }), visitor({ id: 'b', name: 'Bruno' })],
		{
			pendingId: 'a',
		},
	);
	assert.equal(html.split('disabled=""').length - 1, 1);
});

test('disables every checkbox when the user cannot manage visitors', () => {
	const html = render([visitor({})], { canToggle: false });
	assert.match(html, /disabled=""/);
});
