import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ReorderButtons } from '@/features/admin/components/reorder-buttons';

test('the up button is disabled when canMoveUp is false', () => {
	const html = renderToStaticMarkup(
		createElement(ReorderButtons, {
			canMoveUp: false,
			canMoveDown: true,
			onMoveUp: () => {},
			onMoveDown: () => {},
		}),
	);
	assert.match(html, /disabled=""[^>]*aria-label="Mover para cima"/);
});

test('the down button is disabled when canMoveDown is false', () => {
	const html = renderToStaticMarkup(
		createElement(ReorderButtons, {
			canMoveUp: true,
			canMoveDown: false,
			onMoveUp: () => {},
			onMoveDown: () => {},
		}),
	);
	assert.match(html, /disabled=""[^>]*aria-label="Mover para baixo"/);
});

test('neither button is disabled when both directions are available', () => {
	const html = renderToStaticMarkup(
		createElement(ReorderButtons, {
			canMoveUp: true,
			canMoveDown: true,
			onMoveUp: () => {},
			onMoveDown: () => {},
		}),
	);
	assert.doesNotMatch(html, /disabled=""/);
});
