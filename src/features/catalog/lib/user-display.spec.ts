import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	getInitials,
	getDisplayName,
} from '@/features/catalog/lib/user-display';

test('getInitials takes the first letter of the first two words', () => {
	assert.equal(getInitials('Ana Beatriz Souza'), 'AB');
});

test('getInitials handles a two-word name', () => {
	assert.equal(getInitials('Ana Beatriz'), 'AB');
});

test('getInitials handles a single-word name', () => {
	assert.equal(getInitials('Ana'), 'A');
});

test('getInitials returns an empty string for null', () => {
	assert.equal(getInitials(null), '');
});

test('getDisplayName keeps only the first two words', () => {
	assert.equal(getDisplayName('Ana Beatriz Souza'), 'Ana Beatriz');
});

test('getDisplayName handles a single-word name', () => {
	assert.equal(getDisplayName('Ana'), 'Ana');
});

test('getDisplayName returns an empty string for null', () => {
	assert.equal(getDisplayName(null), '');
});
