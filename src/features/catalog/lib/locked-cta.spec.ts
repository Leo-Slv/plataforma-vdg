import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getLockedCta } from '@/features/catalog/lib/locked-cta';

const verified = { emailVerified: true, requestStatus: null };

test('an unverified e-mail always comes first, whatever the course', () => {
	for (const course of [
		{ pricingModel: 'Free', priceAmount: null },
		{ pricingModel: 'Paid', priceAmount: 49.9 },
		{ pricingModel: 'EnrollmentControlled', priceAmount: null },
	] as const) {
		assert.equal(
			getLockedCta(course, { emailVerified: false, requestStatus: null }).kind,
			'verify-email',
		);
	}
});

test('a paid course with a price is bought, even with an old request around', () => {
	assert.equal(
		getLockedCta(
			{ pricingModel: 'Paid', priceAmount: 49.9 },
			{ emailVerified: true, requestStatus: 'Rejected' },
		).kind,
		'buy',
	);
});

test('a locked free course is members-only, with nothing to click', () => {
	assert.equal(
		getLockedCta({ pricingModel: 'Free', priceAmount: null }, verified).kind,
		'members-only',
	);
});

test('enrollment-controlled courses are requested', () => {
	assert.equal(
		getLockedCta(
			{ pricingModel: 'EnrollmentControlled', priceAmount: null },
			verified,
		).kind,
		'request',
	);
});

test('a paid course without a price falls back to requesting access', () => {
	assert.equal(
		getLockedCta({ pricingModel: 'Paid', priceAmount: null }, verified).kind,
		'request',
	);
	assert.equal(
		getLockedCta({ pricingModel: 'Paid', priceAmount: 0 }, verified).kind,
		'request',
	);
});

test('reflects the state of the last access request', () => {
	const course = {
		pricingModel: 'EnrollmentControlled',
		priceAmount: null,
	} as const;

	assert.equal(
		getLockedCta(course, { emailVerified: true, requestStatus: 'Pending' })
			.kind,
		'request-pending',
	);
	assert.equal(
		getLockedCta(course, { emailVerified: true, requestStatus: 'Rejected' })
			.kind,
		'request-rejected',
	);
	assert.equal(
		getLockedCta(course, { emailVerified: true, requestStatus: 'Approved' })
			.kind,
		'request',
	);
});
