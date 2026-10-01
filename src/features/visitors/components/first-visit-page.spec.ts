import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FirstVisitPage } from '@/features/visitors/components/first-visit-page';
import { SERVICE_TIMES } from '@/features/visitors/lib/first-visit-messages';

const html = renderToStaticMarkup(
	createElement(
		QueryClientProvider,
		{ client: new QueryClient() },
		createElement(FirstVisitPage),
	),
);

test('renders the header with brand and service times', () => {
	assert.match(html, /Viver da Graça/);
	assert.ok(html.includes(SERVICE_TIMES));
});

test('renders the hero badge and heading', () => {
	assert.match(html, /Primeira vez aqui/);
	assert.match(html, /Que bom ter/);
	assert.match(html, /com a gente\./);
});

test('renders the four fields with the optional address hint', () => {
	for (const label of ['Nome completo', 'Telefone', 'E-mail', 'Endereço']) {
		assert.ok(html.includes(label), label);
	}
	assert.match(html, /opcional/);
});

test('mounts exactly one form for every breakpoint', () => {
	assert.equal(html.match(/<form/g)?.length, 1);
});

test('enables submit when Turnstile is not configured', () => {
	assert.ok(!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
	assert.match(html, /<button type="submit"[^>]*>Enviar<\/button>/);
	assert.doesNotMatch(html, /<button type="submit"[^>]*disabled=""/);
});
