import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VisitorInputField } from '@/features/visitors/components/visitor-input-field';

test('renders the label without a hint and as valid by default', () => {
	const html = renderToStaticMarkup(
		createElement(VisitorInputField, { label: 'Nome completo', name: 'name' }),
	);

	assert.match(html, /Nome completo/);
	assert.doesNotMatch(html, /opcional/);
	assert.match(html, /aria-invalid="false"/);
});

test('renders the hint next to the label when provided', () => {
	const html = renderToStaticMarkup(
		createElement(VisitorInputField, {
			label: 'Endereço',
			hint: 'opcional',
			name: 'address',
		}),
	);

	assert.match(html, /Endereço/);
	assert.match(html, /opcional/);
});

test('marks the input invalid when flagged', () => {
	const html = renderToStaticMarkup(
		createElement(VisitorInputField, {
			label: 'Telefone',
			name: 'phone',
			invalid: true,
		}),
	);

	assert.match(html, /aria-invalid="true"/);
});
