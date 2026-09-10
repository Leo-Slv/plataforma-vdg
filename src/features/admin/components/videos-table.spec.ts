import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
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

test('renders "Nenhum vídeo cadastrado." when there are no videos', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [],
			lessonLookup: new Map(),
			lookupReady: true,
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
		}),
	);
	assert.match(html, /dQw4w9WgXcQ/);
	assert.match(html, /youtube\.com\/watch\?v=dQw4w9WgXcQ/);
});

test('links each row to its edit route with the video and lesson ids', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ id: 'video-1', lessonId: 'lesson-1' })],
			lessonLookup: new Map(),
			lookupReady: true,
		}),
	);
	assert.match(
		html,
		new RegExp(
			`href="${appRoutes.admin.videoEdit('video-1', 'lesson-1').replace('?', '\\?')}"`,
		),
	);
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
		}),
	);
	assert.match(html, /…/);
});

test('renders "Ativo" for an active video', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ visibility: 'Active' })],
			lessonLookup: new Map(),
			lookupReady: true,
		}),
	);
	assert.match(html, /Ativo/);
});

test('renders "Não listado" for an unlisted video', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ visibility: 'Unlisted' })],
			lessonLookup: new Map(),
			lookupReady: true,
		}),
	);
	assert.match(html, /Não listado/);
});

test('renders the duration in minutes', () => {
	const html = renderToStaticMarkup(
		createElement(VideosTable, {
			videos: [buildVideo({ durationSeconds: 1080 })],
			lessonLookup: new Map(),
			lookupReady: true,
		}),
	);
	assert.match(html, /18min/);
});
