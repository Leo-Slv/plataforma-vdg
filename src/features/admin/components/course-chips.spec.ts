import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CourseChips } from '@/features/admin/components/course-chips';

test('renders "Todos" for an admin, ignoring names', () => {
	const html = renderToStaticMarkup(
		createElement(CourseChips, { status: 'admin', names: ['Discipulado'] }),
	);
	assert.match(html, /Todos/);
	assert.doesNotMatch(html, /Discipulado/);
});

test('renders a placeholder while pending', () => {
	const html = renderToStaticMarkup(
		createElement(CourseChips, { status: 'pending', names: [] }),
	);
	assert.match(html, /…/);
});

test('renders a dash on error', () => {
	const html = renderToStaticMarkup(
		createElement(CourseChips, { status: 'error', names: [] }),
	);
	assert.match(html, /—/);
});

test('renders "Nenhuma" when ready with no granted courses', () => {
	const html = renderToStaticMarkup(
		createElement(CourseChips, { status: 'ready', names: [] }),
	);
	assert.match(html, /Nenhuma/);
});

test('renders one chip per granted course title', () => {
	const html = renderToStaticMarkup(
		createElement(CourseChips, {
			status: 'ready',
			names: ['Discipulado', 'Liderança'],
		}),
	);
	assert.match(html, /Discipulado/);
	assert.match(html, /Liderança/);
});
