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

const NOOP_REPLY = {
	isReplying: false,
	replyText: '',
	onReplyTextChange: () => {},
	onStartReply: () => {},
	onCancelReply: () => {},
	onSubmitReply: () => {},
	isSubmitting: false,
};

test('renders no "Responder" button without the reply prop (no permission)', () => {
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, { question: BASE_QUESTION }),
	);

	assert.doesNotMatch(html, /Responder/);
});

test('renders a "Responder" button for an unanswered question when reply is passed', () => {
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, {
			question: BASE_QUESTION,
			reply: NOOP_REPLY,
		}),
	);

	assert.match(html, /Responder/);
	assert.doesNotMatch(html, /<textarea/);
});

test('renders the reply textarea and actions while isReplying is true', () => {
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, {
			question: BASE_QUESTION,
			reply: { ...NOOP_REPLY, isReplying: true },
		}),
	);

	assert.match(html, /<textarea/);
	assert.match(html, /Enviar resposta/);
	assert.match(html, /Cancelar/);
});

test('does not render "Responder" for an already-answered question even with reply passed', () => {
	const answered: LessonQuestion = {
		...BASE_QUESTION,
		answerText: 'O chamado vem antes de qualquer cargo.',
		answeredByName: 'Pr. João',
	};
	const html = renderToStaticMarkup(
		createElement(LessonQuestionItem, {
			question: answered,
			reply: NOOP_REPLY,
		}),
	);

	assert.doesNotMatch(html, /Responder/);
});
