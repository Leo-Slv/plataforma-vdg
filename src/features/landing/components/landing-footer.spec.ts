import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LandingFooter } from '@/features/landing/components/landing-footer';

test('links Termos and Privacidade to their pages', () => {
	const html = renderToStaticMarkup(
		createElement(LandingFooter, { supportHref: null }),
	);

	assert.match(html, /href="\/termos"[^>]*>Termos</);
	assert.match(html, /href="\/privacidade"[^>]*>Privacidade</);
});

test('omits "Suporte" when no support channel is configured', () => {
	const html = renderToStaticMarkup(
		createElement(LandingFooter, { supportHref: null }),
	);

	assert.doesNotMatch(html, /Suporte/);
});

test('links "Suporte" to the configured channel', () => {
	const email = renderToStaticMarkup(
		createElement(LandingFooter, { supportHref: 'mailto:suporte@igreja.org' }),
	);
	const whatsapp = renderToStaticMarkup(
		createElement(LandingFooter, {
			supportHref: 'https://wa.me/5511999990000',
		}),
	);

	assert.match(email, /href="mailto:suporte@igreja\.org"[^>]*>Suporte</);
	assert.match(whatsapp, /href="https:\/\/wa\.me\/5511999990000"/);
	assert.match(whatsapp, /target="_blank"/);
	assert.match(whatsapp, /rel="noreferrer"/);
});
