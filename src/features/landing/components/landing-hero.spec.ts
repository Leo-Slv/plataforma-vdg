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

test('renders no stat row when stats are not provided', () => {
	const html = renderToStaticMarkup(createElement(LandingHero));
	assert.doesNotMatch(html, /áreas de ensino/);
});

test('renders real stat numbers when stats are provided', () => {
	const html = renderToStaticMarkup(
		createElement(LandingHero, {
			stats: { activeAreaCount: 5, publishedCourseCount: 12 },
		}),
	);
	assert.match(html, /áreas de ensino/);
	assert.match(html, />5</);
	assert.match(html, />12</);
	assert.match(html, /anos de igreja/);
});
