import { test } from 'node:test';
import assert from 'node:assert/strict';

import { latestRequestStatus } from '@/features/catalog/lib/latest-request-status';
import type { AccessRequest } from '@/features/catalog/model/access-request';

function request(overrides: Partial<AccessRequest>): AccessRequest {
	return {
		id: 'r1',
		userId: 'u1',
		courseId: 'c1',
		status: 'Pending',
		decidedAt: null,
		decidedByUserId: null,
		createdAt: '2026-10-01T10:00:00.000Z',
		...overrides,
	};
}

test('returns null when the user never asked for the course', () => {
	assert.equal(latestRequestStatus(undefined, 'c1'), null);
	assert.equal(latestRequestStatus([], 'c1'), null);
	assert.equal(
		latestRequestStatus([request({ courseId: 'other' })], 'c1'),
		null,
	);
});

test('returns the status of the most recent request for that course', () => {
	const requests = [
		request({
			id: 'old',
			status: 'Rejected',
			createdAt: '2026-09-01T10:00:00.000Z',
		}),
		request({
			id: 'new',
			status: 'Pending',
			createdAt: '2026-10-05T10:00:00.000Z',
		}),
		request({ id: 'other', courseId: 'c2', status: 'Approved' }),
	];

	assert.equal(latestRequestStatus(requests, 'c1'), 'Pending');
});
