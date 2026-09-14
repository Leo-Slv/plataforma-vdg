import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LessonQuestionItem } from '@/features/catalog/components/lesson-question-item';
import type { LessonQuestion } from '@/features/catalog/model/lesson-question';

const BASE_QUESTION: LessonQuestion = {
	id: 'q1',
	askedByName: 'Maria Souza',
	questionText: 'Qual a diferença entre chamado e função?',
	answerText: null,
	answeredByName: null,
	createdAt: new Date().toISOString(),
};

test('renders the asker name and question text', () => {
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, { question: BASE_QUESTION }),
	);

	assert.match(html, /Maria Souza/);
	assert.match(html, /Qual a diferença entre chamado e função\?/);
});

test('renders no reply block when there is no answer yet', () => {
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, { question: BASE_QUESTION }),
	);

	assert.doesNotMatch(html, /oklch\(0\.62_0\.1_248\)/);
});

test('renders the answerer name and answer text once answered', () => {
	const answered: LessonQuestion = {
		...BASE_QUESTION,
		answerText: 'O chamado vem antes de qualquer cargo.',
		answeredByName: 'Pr. João',
	};
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, { question: answered }),
	);

	assert.match(html, /Pr\. João/);
	assert.match(html, /O chamado vem antes de qualquer cargo\./);
});
