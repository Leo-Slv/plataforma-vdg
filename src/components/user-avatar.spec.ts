import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { UserAvatar } from '@/components/user-avatar';

test('renders an img when avatarUrl is set', () => {
	const html = renderToStaticMarkup(
		createElement(UserAvatar, {
			avatarUrl: 'https://example.com/avatar.jpg',
			initials: 'AB',
		}),
	);
	assert.match(html, /<img[^>]*src="https:\/\/example\.com\/avatar\.jpg"/);
});

test('renders initials when avatarUrl is null', () => {
	const html = renderToStaticMarkup(
		createElement(UserAvatar, {
			avatarUrl: null,
			initials: 'AB',
		}),
	);
	assert.doesNotMatch(html, /<img/);
	assert.match(html, />AB</);
});
