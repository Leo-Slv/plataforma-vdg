import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VideosTable } from '@/features/admin/components/videos-table';
import type { Video } from '@/features/admin/model/video';
import type { LessonLookupEntry } from '@/features/admin/lib/build-lesson-lookup';

function buildVideo(overrides: Partial<Video>): Video {
	return {
		id: 'video-1',
		lessonId: 'lesson-1',
		title: 'Aula 3',
		description: '',
		storageProvider: 'YouTube',
		storageKey: 'dQw4w9WgXcQ',
		playbackUrl: null,
		thumbnailUrl: null,
		durationSeconds: 1080,
		sizeBytes: 0,
		status: 'Ready',
		visibility: 'Active',
		youTubeVideoId: 'dQw4w9WgXcQ',
		youTubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z',
		...overrides,
	};
}

const noop = () => {};

test('renders "Nenhum vídeo cadastrado." when there are no videos', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [],
			lessonLookup: new Map(),
			lookupReady: true,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /Nenhum vídeo cadastrado\./);
});

test('renders the YouTube id and derived url', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({})],
			lessonLookup: new Map(),
			lookupReady: true,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /dQw4w9WgXcQ/);
	assert.match(html, /youtube\.com\/watch\?v=dQw4w9WgXcQ/);
});

test('resolves the lesson label from the lookup', () => {
	const lookup = new Map<string, LessonLookupEntry>([
		[
			'lesson-1',
			{
				courseTitle: 'Escola de Líderes',
				lessonTitle: 'Aula 3',
				modulePosition: 3,
			},
		],
	]);
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ lessonId: 'lesson-1' })],
			lessonLookup: lookup,
			lookupReady: true,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /Escola de Líderes · Aula 03/);
});

test('shows a placeholder while the lesson lookup is still loading', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ lessonId: 'lesson-1' })],
			lessonLookup: new Map(),
			lookupReady: false,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /…/);
});

test('renders "Ativo" with a "Não listar" action for an active video', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ visibility: 'Active' })],
			lessonLookup: new Map(),
			lookupReady: true,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /Ativo/);
	assert.match(html, /Não listar/);
});

test('renders "Não listado" with an "Ativar" action for an unlisted video', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ visibility: 'Unlisted' })],
			lessonLookup: new Map(),
			lookupReady: true,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /Não listado/);
	assert.match(html, /Ativar/);
});

test('renders the duration in minutes', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ durationSeconds: 1080 })],
			lessonLookup: new Map(),
			lookupReady: true,
			pendingVideoId: null,
			onActivate: noop,
			onUnlist: noop,
		}),
	);
	assert.match(html, /18min/);
});
