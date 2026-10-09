import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	formatIssueDate,
	formatShortIssueDate,
} from '@/features/certificates/lib/format-issue-date';

test('formats the issue date in long Portuguese form', () => {
	assert.equal(
		formatIssueDate('2026-10-05T15:00:00.000Z'),
		'5 de outubro de 2026',
	);
});

test('formats the short date as DD/MM/AAAA', () => {
	assert.equal(formatShortIssueDate('2026-10-05T15:00:00.000Z'), '05/10/2026');
});

test('uses the church time zone, so a late-evening UTC time keeps its local day', () => {
	assert.equal(formatShortIssueDate('2026-10-06T01:30:00.000Z'), '05/10/2026');
});
