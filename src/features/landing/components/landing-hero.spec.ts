import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { LandingHero } from '@/features/landing/components/landing-hero';

test('renders the headline and wires both CTAs to their routes', () => {
	const html = renderToStaticMarkup(createElement(LandingHero));

	assert.match(html, /sustenta a/);
	assert.match(html, new RegExp(`href="${appRoutes.auth.register}"`));
	assert.match(html, new RegExp(`href="${appRoutes.catalog.index}"`));
});
