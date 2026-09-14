import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LessonMaterialPanel } from '@/features/catalog/components/lesson-material-panel';

test('renders the static "Em breve" label', () => {
	const html = renderToStaticMarkup(createElement(LessonMaterialPanel));
	assert.match(html, /Em breve/);
});

test('renders no file cards or interactive controls', () => {
	const html = renderToStaticMarkup(createElement(LessonMaterialPanel));
	assert.doesNotMatch(html, /<button/);
	assert.doesNotMatch(html, /<a /);
});
