import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatRoleNames } from '@/features/admin/lib/format-role-names';

test('joins multiple role names with a comma', () => {
	assert.equal(formatRoleNames(['Admin', 'Suporte']), 'Admin, Suporte');
});

test('returns a single role name as-is', () => {
	assert.equal(formatRoleNames(['Aluna']), 'Aluna');
});

test('returns "Sem papel" for an empty list', () => {
	assert.equal(formatRoleNames([]), 'Sem papel');
});
