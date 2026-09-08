import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AreaChips } from '@/features/admin/components/area-chips';

test('renders "Todas" for an admin, ignoring names', () => {
	const html = renderToStaticMarkup(
		createElement(AreaChips, { status: 'admin', names: ['Discipulado'] }),
	);
	assert.match(html, /Todas/);
	assert.doesNotMatch(html, /Discipulado/);
});

test('renders a placeholder while pending', () => {
	const html = renderToStaticMarkup(
		createElement(AreaChips, { status: 'pending', names: [] }),
	);
	assert.match(html, /…/);
});

test('renders a dash on error', () => {
	const html = renderToStaticMarkup(
		createElement(AreaChips, { status: 'error', names: [] }),
	);
	assert.match(html, /—/);
});

test('renders "Nenhuma" when ready with no granted areas', () => {
	const html = renderToStaticMarkup(
		createElement(AreaChips, { status: 'ready', names: [] }),
	);
	assert.match(html, /Nenhuma/);
});

test('renders one chip per granted area name', () => {
	const html = renderToStaticMarkup(
		createElement(AreaChips, {
			status: 'ready',
			names: ['Discipulado', 'Liderança'],
		}),
	);
	assert.match(html, /Discipulado/);
	assert.match(html, /Liderança/);
});
