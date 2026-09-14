import { test } from 'node:test';
import assert from 'node:assert/strict';

import { videoFormSchema } from '@/features/admin/schemas/video-form.schema';

const VALID_FILE = new File(['x'], 'aula.mp4', { type: 'video/mp4' });

test('accepts a valid YouTube entry', () => {
	const result = videoFormSchema.safeParse({
		storageProvider: 'YouTube',
		title: 'Aula 1',
		description: '',
		youtubeVideoId: 'abc123',
		durationMinutes: '10',
	});
	assert.equal(result.success, true);
});

test('rejects a YouTube entry with an empty video id', () => {
	const result = videoFormSchema.safeParse({
		storageProvider: 'YouTube',
		title: 'Aula 1',
		description: '',
		youtubeVideoId: '',
		durationMinutes: '10',
	});
	assert.equal(result.success, false);
});

test('rejects a non-integer or zero duration', () => {
	const result = videoFormSchema.safeParse({
		storageProvider: 'YouTube',
		title: 'Aula 1',
		description: '',
		youtubeVideoId: 'abc123',
		durationMinutes: '0',
	});
	assert.equal(result.success, false);
});

test('accepts a valid internal-storage entry with a file selected', () => {
	const result = videoFormSchema.safeParse({
		storageProvider: 'S3',
		title: 'Aula 1',
		description: '',
		file: VALID_FILE,
		durationMinutes: '10',
	});
	assert.equal(result.success, true);
});

test('rejects an internal-storage entry with no file selected', () => {
	const result = videoFormSchema.safeParse({
		storageProvider: 'S3',
		title: 'Aula 1',
		description: '',
		file: null,
		durationMinutes: '10',
	});
	assert.equal(result.success, false);
});
