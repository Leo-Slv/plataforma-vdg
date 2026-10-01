import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { FirstVisitSuccess } from '@/features/visitors/components/first-visit-success';

const html = renderToStaticMarkup(
	createElement(FirstVisitSuccess, {
		name: 'Ana Lima',
		phone: '(11) 98765-4321',
		onReset: () => {},
	}),
);

test('thanks the visitor by first name', () => {
	assert.match(html, /Obrigado, Ana\./);
	assert.doesNotMatch(html, /Obrigado, Ana Lima/);
});

test('mentions the masked phone the team will call', () => {
	assert.match(html, /pelo telefone \(11\) 98765-4321 em breve\./);
});

test('announces itself and offers to register another person', () => {
	assert.match(html, /role="status"/);
	assert.match(html, /Cadastrar outra pessoa/);
});
