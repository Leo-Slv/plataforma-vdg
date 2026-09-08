import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PaginationControls } from '@/features/admin/components/pagination-controls';

const noop = () => {};

test('disables "Anterior" on the first page', () => {
	const html = renderToStaticMarkup(
		createElement(PaginationControls, {
			page: 1,
			totalPages: 3,
			onPrevious: noop,
			onNext: noop,
		}),
	);
	assert.match(html, /disabled=""[^>]*>Anterior/);
});

test('disables "Próxima" on the last page', () => {
	const html = renderToStaticMarkup(
		createElement(PaginationControls, {
			page: 3,
			totalPages: 3,
			onPrevious: noop,
			onNext: noop,
		}),
	);
	assert.match(html, /disabled=""[^>]*>Próxima/);
});

test('neither button is disabled on a middle page', () => {
	const html = renderToStaticMarkup(
		createElement(PaginationControls, {
			page: 2,
			totalPages: 3,
			onPrevious: noop,
			onNext: noop,
		}),
	);
	assert.doesNotMatch(html, /disabled=""/);
});

test('renders the page/total label', () => {
	const html = renderToStaticMarkup(
		createElement(PaginationControls, {
			page: 2,
			totalPages: 5,
			onPrevious: noop,
			onNext: noop,
		}),
	);
	assert.match(html, /Página 2 de 5/);
});
