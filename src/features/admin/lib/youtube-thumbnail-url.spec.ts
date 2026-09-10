import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildYouTubeThumbnailUrl } from '@/features/admin/lib/youtube-thumbnail-url';

test('builds the predictable YouTube thumbnail URL from a video id', () => {
	assert.equal(
		buildYouTubeThumbnailUrl('dQw4w9WgXcQ'),
		'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
	);
});
