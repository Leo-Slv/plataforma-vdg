import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VideoPlayer } from '@/features/catalog/components/video-player';

test('renders an iframe for a YouTube playback URL', () => {
	const html = renderToStaticMarkup(
		createElement(VideoPlayer, {
			status: 'ready',
			playbackUrl: 'https://www.youtube-nocookie.com/embed/abc123',
		}),
	);
	assert.match(html, /<iframe/);
	assert.match(
		html,
		/src="https:\/\/www\.youtube-nocookie\.com\/embed\/abc123"/,
	);
});

test('renders a native video element for a non-YouTube playback URL', () => {
	const html = renderToStaticMarkup(
		createElement(VideoPlayer, {
			status: 'ready',
			playbackUrl: 'https://cdn.example.com/videos/abc.mp4',
		}),
	);
	assert.match(html, /<video/);
	assert.doesNotMatch(html, /<iframe/);
});

test('renders a loading message', () => {
	const html = renderToStaticMarkup(
		createElement(VideoPlayer, { status: 'loading' }),
	);
	assert.match(html, /Carregando vídeo…/);
});

test('renders an error message', () => {
	const html = renderToStaticMarkup(
		createElement(VideoPlayer, { status: 'error' }),
	);
	assert.match(html, /Não foi possível carregar o vídeo agora\./);
});

test('falls back to the static placeholder when there is no video', () => {
	const html = renderToStaticMarkup(
		createElement(VideoPlayer, { status: 'no-video' }),
	);
	assert.match(html, /Player em breve/);
});
