import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { FormField } from '@/features/auth/components/form-field';

test('renders the label and no error text by default', () => {
	const html = renderToStaticMarkup(
		createElement(FormField, { label: 'Nome completo', name: 'name' }),
	);

	assert.match(html, /Nome completo/);
	assert.doesNotMatch(html, /<p/);
});

test('renders the error message when provided', () => {
	const html = renderToStaticMarkup(
		createElement(FormField, {
			label: 'E-mail',
			name: 'email',
			error: 'E-mail inválido.',
		}),
	);

	assert.match(html, /E-mail inválido\./);
	assert.match(html, /aria-invalid="true"/);
});
