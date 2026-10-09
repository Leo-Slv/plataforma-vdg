import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '@/lib/http/api-error';
import { shouldRetryQuery } from '@/lib/query/query-client';

test('does not retry client errors such as 403, 404 and 409', () => {
	for (const status of [400, 401, 403, 404, 409, 422]) {
		assert.equal(
			shouldRetryQuery(0, new ApiError('x', status)),
			false,
			String(status),
		);
	}
});

test('retries once for timeouts, network failures and server errors', () => {
	assert.equal(shouldRetryQuery(0, new ApiError('x', 408)), true);
	assert.equal(shouldRetryQuery(0, new ApiError('x', 500)), true);
	assert.equal(shouldRetryQuery(0, new ApiError('x', 503)), true);
	assert.equal(shouldRetryQuery(0, new Error('network')), true);
});

test('gives up after the first retry', () => {
	assert.equal(shouldRetryQuery(1, new ApiError('x', 503)), false);
});
