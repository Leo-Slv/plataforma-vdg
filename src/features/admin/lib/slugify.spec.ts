import { test } from 'node:test';
import assert from 'node:assert/strict';

import { slugify } from '@/features/admin/lib/slugify';

test('slugify lowercases and hyphenates spaces', () => {
	assert.equal(slugify('Escola de Líderes'), 'escola-de-lideres');
});

test('slugify strips diacritics', () => {
	assert.equal(slugify('Formação'), 'formacao');
	assert.equal(slugify('Liderança'), 'lideranca');
});

test('slugify collapses punctuation and repeated separators into a single hyphen', () => {
	assert.equal(slugify('Área — 2026!'), 'area-2026');
	assert.equal(slugify('Múltiplos   Espaços'), 'multiplos-espacos');
});

test('slugify trims leading and trailing hyphens', () => {
	assert.equal(slugify('  -Área-  '), 'area');
});

test('slugify returns an empty string for empty input', () => {
	assert.equal(slugify(''), '');
	assert.equal(slugify('   '), '');
});
