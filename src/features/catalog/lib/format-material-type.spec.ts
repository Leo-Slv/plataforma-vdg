import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatMaterialType } from '@/features/catalog/lib/format-material-type';

test('labels a known content type', () => {
	assert.equal(formatMaterialType('application/pdf'), 'PDF');
});

test('falls back to a generic label for an unknown content type', () => {
	assert.equal(formatMaterialType('application/octet-stream'), 'Arquivo');
});
