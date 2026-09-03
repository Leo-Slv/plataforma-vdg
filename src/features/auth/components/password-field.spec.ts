import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PasswordField } from '@/features/auth/components/password-field';

test('starts masked, with the "mostrar" toggle and the length helper', () => {
	const html = renderToStaticMarkup(
		createElement(PasswordField, {
			label: 'Senha',
			name: 'password',
			value: '',
			onChange: () => {},
		}),
	);

	assert.match(html, /type="password"/);
	assert.match(html, />mostrar</);
	assert.match(html, /Mínimo de 12 caracteres\./);
});

test('renders the error message when provided', () => {
	const html = renderToStaticMarkup(
		createElement(PasswordField, {
			label: 'Senha',
			name: 'password',
			value: 'short',
			onChange: () => {},
			error: 'Mínimo de 12 caracteres.',
		}),
	);

	assert.match(html, /aria-invalid="true"/);
});
