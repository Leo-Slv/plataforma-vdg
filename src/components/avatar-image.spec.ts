import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AvatarImage } from '@/components/avatar-image';

test('renders the given src when present', () => {
	const html = renderToStaticMarkup(
		createElement(AvatarImage, {
			src: 'https://example.com/avatar.jpg',
			fallbackSrc: '/brand/viver-da-graca-mark.png',
		}),
	);
	assert.match(html, /src="https:\/\/example\.com\/avatar\.jpg"/);
});

test('renders the fallback src when src is null', () => {
	const html = renderToStaticMarkup(
		createElement(AvatarImage, {
			src: null,
			fallbackSrc: '/brand/viver-da-graca-mark.png',
		}),
	);
	assert.match(html, /src="\/brand\/viver-da-graca-mark\.png"/);
});
