type PricingModel = 'Free' | 'Paid' | 'EnrollmentControlled';

/**
 * Mirrors the backend's own rule (Course.ValidatePriceAmount): a price
 * is only ever meaningful — and only ever accepted — for a Paid course.
 */
function resolvePriceAmount(
	pricingModel: PricingModel,
	rawInput: string,
): number | null {
	if (pricingModel !== 'Paid') {
		return null;
	}

	return Number(rawInput);
}

export { resolvePriceAmount };
export type { PricingModel };
