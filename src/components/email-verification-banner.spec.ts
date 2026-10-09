import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { EmailVerificationBanner } from '@/components/email-verification-banner';

test('renders nothing when the e-mail is confirmed (or still unknown)', () => {
	const html = renderToStaticMarkup(
		createElement(EmailVerificationBanner, { unverified: false }),
	);

	assert.equal(html, '');
});

test('explains the lock and links to the confirmation screen', () => {
	const html = renderToStaticMarkup(
		createElement(EmailVerificationBanner, { unverified: true }),
	);

	assert.match(html, /Confirme seu e-mail para liberar as aulas/);
	assert.match(html, /href="\/confirm-email"/);
	assert.match(html, /role="status"/);
});
