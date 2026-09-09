import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LessonVideoPanel } from '@/features/admin/components/lesson-video-panel';
import type { Video } from '@/features/admin/model/video';

function buildVideo(overrides: Partial<Video>): Video {
	return {
		id: 'video-1',
		lessonId: 'lesson-1',
		title: 'Visão e propósito',
		description: '',
		storageProvider: 'YouTube',
		storageKey: 'abc123',
		playbackUrl: null,
		thumbnailUrl: null,
		durationSeconds: 1080,
		sizeBytes: 0,
		status: 'Ready',
		visibility: 'Active',
		youTubeVideoId: 'abc123',
		youTubeUrl: 'https://www.youtube.com/watch?v=abc123',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z',
		...overrides,
	};
}

const noop = () => {};

test('renders the empty state with "Adicionar vídeo" when there is no video and the admin can manage videos', () => {
	const html = renderToStaticMarkup(
		createElement(LessonVideoPanel, {
			video: null,
			isLoading: false,
			hasError: false,
			canManage: true,
			isMutating: false,
			onAdd: noop,
			onReplace: noop,
			onRemove: noop,
		}),
	);
	assert.match(html, /Nenhum vídeo cadastrado ainda\./);
	assert.match(html, /Adicionar vídeo/);
});

test('hides the add action and explains why when the admin cannot manage videos', () => {
	const html = renderToStaticMarkup(
		createElement(LessonVideoPanel, {
			video: null,
			isLoading: false,
			hasError: false,
			canManage: false,
			isMutating: false,
			onAdd: noop,
			onReplace: noop,
			onRemove: noop,
		}),
	);
	assert.doesNotMatch(html, /Adicionar vídeo/);
	assert.match(html, /Requer a permissão de gerenciar vídeos\./);
});

test('renders duration and status for a registered video', () => {
	const html = renderToStaticMarkup(
		createElement(LessonVideoPanel, {
			video: buildVideo({ durationSeconds: 1080, status: 'Ready' }),
			isLoading: false,
			hasError: false,
			canManage: true,
			isMutating: false,
			onAdd: noop,
			onReplace: noop,
			onRemove: noop,
		}),
	);
	assert.match(html, /18min · Pronto/);
	assert.match(html, /Substituir vídeo/);
	assert.match(html, /Remover vídeo/);
});

test('renders "Processando" for a video still processing', () => {
	const html = renderToStaticMarkup(
		createElement(LessonVideoPanel, {
			video: buildVideo({ status: 'Processing' }),
			isLoading: false,
			hasError: false,
			canManage: true,
			isMutating: false,
			onAdd: noop,
			onReplace: noop,
			onRemove: noop,
		}),
	);
	assert.match(html, /Processando/);
});

test('renders the loading state', () => {
	const html = renderToStaticMarkup(
		createElement(LessonVideoPanel, {
			video: null,
			isLoading: true,
			hasError: false,
			canManage: true,
			isMutating: false,
			onAdd: noop,
			onReplace: noop,
			onRemove: noop,
		}),
	);
	assert.match(html, /Carregando…/);
});

test('renders the error state', () => {
	const html = renderToStaticMarkup(
		createElement(LessonVideoPanel, {
			video: null,
			isLoading: false,
			hasError: true,
			canManage: true,
			isMutating: false,
			onAdd: noop,
			onReplace: noop,
			onRemove: noop,
		}),
	);
	assert.match(html, /Não foi possível carregar o vídeo desta aula agora\./);
});
