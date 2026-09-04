import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LessonVideoPlaceholder } from '@/features/catalog/components/lesson-video-placeholder';

test('renders the static "Player em breve" label', () => {
	const html = renderToStaticMarkup(createElement(LessonVideoPlaceholder));
	assert.match(html, /Player em breve/);
});

test('renders no interactive play control', () => {
	const html = renderToStaticMarkup(createElement(LessonVideoPlaceholder));
	assert.doesNotMatch(html, /<button/);
	assert.doesNotMatch(html, /<a /);
});
