import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getSupportHref } from '@/lib/support-link';

test('returns null when no channel is configured', () => {
	assert.equal(getSupportHref({ email: '', whatsapp: '' }), null);
});

test('builds a mailto link from the e-mail', () => {
	assert.equal(
		getSupportHref({ email: ' suporte@igreja.org ', whatsapp: '' }),
		'mailto:suporte@igreja.org',
	);
});

test('builds a wa.me link keeping only the digits of the number', () => {
	assert.equal(
		getSupportHref({ email: '', whatsapp: '+55 (11) 99999-0000' }),
		'https://wa.me/5511999990000',
	);
});

test('prefers WhatsApp when both are set', () => {
	assert.equal(
		getSupportHref({ email: 'suporte@igreja.org', whatsapp: '5511999990000' }),
		'https://wa.me/5511999990000',
	);
});

test('ignores values that are not a valid e-mail or phone', () => {
	assert.equal(
		getSupportHref({ email: 'not-an-email', whatsapp: '123' }),
		null,
	);
});
