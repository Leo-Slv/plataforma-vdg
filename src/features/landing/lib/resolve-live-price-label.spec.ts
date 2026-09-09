import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveLivePriceLabel } from '@/features/landing/lib/resolve-live-price-label';

test('renders Free as Gratuito', () => {
	assert.equal(
		resolveLivePriceLabel({ pricingModel: 'Free', priceAmount: null }),
		'Gratuito',
	);
});

test('renders EnrollmentControlled as Por inscrição regardless of priceAmount', () => {
	assert.equal(
		resolveLivePriceLabel({
			pricingModel: 'EnrollmentControlled',
			priceAmount: 149,
		}),
		'Por inscrição',
	);
});

test('renders Paid with a formatted amount', () => {
	assert.match(
		resolveLivePriceLabel({ pricingModel: 'Paid', priceAmount: 149 }),
		/R\$\s?149/,
	);
});

test('renders Paid with no amount as Pago', () => {
	assert.equal(
		resolveLivePriceLabel({ pricingModel: 'Paid', priceAmount: null }),
		'Pago',
	);
});
