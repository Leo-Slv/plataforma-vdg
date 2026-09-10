import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CoverImage } from '@/components/cover-image';

test('renders an img for a given src', () => {
	const html = renderToStaticMarkup(
		createElement(CoverImage, { src: 'https://example.com/cover.jpg' }),
	);
	assert.match(html, /<img[^>]*src="https:\/\/example\.com\/cover\.jpg"/);
});

test('renders the striped placeholder when src is null', () => {
	const html = renderToStaticMarkup(createElement(CoverImage, { src: null }));
	assert.doesNotMatch(html, /<img/);
	assert.match(html, /repeating-linear-gradient/);
});
