import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LoadingScreen } from '@/components/loading-screen';

test('renders the brand mark', () => {
	const html = renderToStaticMarkup(createElement(LoadingScreen));
	assert.match(html, /alt="Viver da Gra/);
	assert.match(html, /viver-da-graca-mark\.png/);
});

test('renders a spinning ring', () => {
	const html = renderToStaticMarkup(createElement(LoadingScreen));
	assert.match(html, /animate-spin/);
});
