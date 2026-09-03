import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { footerContent } from '@/features/landing/lib/landing-content';
import { LandingPage } from '@/features/landing/components/landing-page';

test('renders every section without throwing', () => {
	const html = renderToStaticMarkup(createElement(LandingPage));

	assert.match(html, /sustenta/);
	assert.match(html, /Comece por aqui/);
	assert.match(html, /Como a escola funciona/);
	assert.match(html, new RegExp(footerContent.orgName));
});
