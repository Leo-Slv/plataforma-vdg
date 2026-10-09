import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LegalPage } from '@/features/legal/components/legal-page';
import {
	LEGAL_DRAFT_NOTICE,
	privacyDocument,
	termsDocument,
} from '@/features/legal/lib/legal-content';

test('renders the terms with title, intro, every section and the draft notice', () => {
	const html = renderToStaticMarkup(
		createElement(LegalPage, { document: termsDocument }),
	);

	assert.match(html, /Termos de uso/);
	assert.match(html, new RegExp(LEGAL_DRAFT_NOTICE.slice(0, 20)));
	for (const section of termsDocument.sections) {
		assert.match(html, new RegExp(section.heading.replace(/[.()]/g, '.')));
	}
});

test('renders the privacy policy', () => {
	const html = renderToStaticMarkup(
		createElement(LegalPage, { document: privacyDocument }),
	);

	assert.match(html, /Política de privacidade/);
	assert.match(html, /LGPD/);
});

test('cross-links the two documents', () => {
	const html = renderToStaticMarkup(
		createElement(LegalPage, { document: termsDocument }),
	);

	assert.match(html, /href="\/termos"/);
	assert.match(html, /href="\/privacidade"/);
});

test('the texts only mention processors the platform really uses', () => {
	const text = JSON.stringify(privacyDocument);

	for (const processor of ['Stripe', 'Resend', 'Turnstile']) {
		assert.match(text, new RegExp(processor));
	}
});
