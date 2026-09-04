import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AppNav } from '@/components/app-nav';

test('renders both nav items as real links', () => {
	const html = renderToStaticMarkup(
		createElement(AppNav, {
			displayName: 'Ana',
			initials: 'AB',
			active: 'catalog',
		}),
	);

	assert.match(html, /<a[^>]*href="\/catalog"/);
	assert.match(html, /<a[^>]*href="\/my-courses"/);
});

test('active="catalog" underlines only Catálogo', () => {
	const html = renderToStaticMarkup(
		createElement(AppNav, {
			displayName: 'Ana',
			initials: 'AB',
			active: 'catalog',
		}),
	);

	const catalogLink = html.match(/<a[^>]*href="\/catalog"[^]*?<\/a>/)?.[0];
	const myCoursesLink = html.match(/<a[^>]*href="\/my-courses"[^]*?<\/a>/)?.[0];

	assert.ok(catalogLink?.includes('border-b'));
	assert.ok(!myCoursesLink?.includes('border-b'));
});

test('active="my-courses" underlines only Meus cursos', () => {
	const html = renderToStaticMarkup(
		createElement(AppNav, {
			displayName: 'Ana',
			initials: 'AB',
			active: 'my-courses',
		}),
	);

	const catalogLink = html.match(/<a[^>]*href="\/catalog"[^]*?<\/a>/)?.[0];
	const myCoursesLink = html.match(/<a[^>]*href="\/my-courses"[^]*?<\/a>/)?.[0];

	assert.ok(!catalogLink?.includes('border-b'));
	assert.ok(myCoursesLink?.includes('border-b'));
});
