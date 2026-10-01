import { test } from 'node:test';
import assert from 'node:assert/strict';

import { maskPhone, phoneDigits } from '@/features/visitors/lib/phone-mask';

test('returns an empty string for empty or non-digit input', () => {
	assert.equal(maskPhone(''), '');
	assert.equal(maskPhone('abc'), '');
});

test('opens the area-code parenthesis for the first two digits', () => {
	assert.equal(maskPhone('1'), '(1');
	assert.equal(maskPhone('11'), '(11');
});

test('separates the area code from up to four more digits', () => {
	assert.equal(maskPhone('113'), '(11) 3');
	assert.equal(maskPhone('119876'), '(11) 9876');
});

test('formats landline numbers (up to 10 digits) as 4-4', () => {
	assert.equal(maskPhone('1134567'), '(11) 3456-7');
	assert.equal(maskPhone('1134567890'), '(11) 3456-7890');
});

test('formats 11-digit mobile numbers as 5-4', () => {
	assert.equal(maskPhone('11987654321'), '(11) 98765-4321');
});

test('strips non-digits and caps at 11 digits', () => {
	assert.equal(maskPhone('(11) 98765-43219999'), '(11) 98765-4321');
	assert.equal(phoneDigits('+55 (11) 98765-4321'), '55119876543');
});

test('re-masking an already masked value is stable', () => {
	assert.equal(maskPhone('(11) 98765-4321'), '(11) 98765-4321');
	assert.equal(maskPhone('(11) 3456-7890'), '(11) 3456-7890');
});
