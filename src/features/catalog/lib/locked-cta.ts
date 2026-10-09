import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';

/**
 * What the price card offers on a course the user can't open yet. Every
 * locked course gets exactly one honest next step — never a button that does
 * nothing.
 *
 * - `verify-email`: nothing unlocks until the e-mail is confirmed.
 * - `buy`: a paid course with a price → Stripe checkout.
 * - `request` / `request-pending` / `request-rejected`: access is granted by
 *   the church team (enrollment-controlled courses, or a paid course that has
 *   no price yet), so the student asks for it.
 * - `members-only`: a free course in a private area; the team grants it, and
 *   there is nothing the student can click.
 */
type LockedCta =
	| { kind: 'verify-email' }
	| { kind: 'buy' }
	| { kind: 'request' }
	| { kind: 'request-pending' }
	| { kind: 'request-rejected' }
	| { kind: 'members-only' };

type LockedCtaContext = {
	emailVerified: boolean;
	/** Status of the user's most recent access request for this course, if any. */
	requestStatus: string | null;
};

function getLockedCta(
	course: Pick<CourseCatalogItem, 'pricingModel' | 'priceAmount'>,
	{ emailVerified, requestStatus }: LockedCtaContext,
): LockedCta {
	if (!emailVerified) {
		return { kind: 'verify-email' };
	}

	if (course.pricingModel === 'Free') {
		return { kind: 'members-only' };
	}

	if (
		course.pricingModel === 'Paid' &&
		course.priceAmount !== null &&
		course.priceAmount > 0
	) {
		return { kind: 'buy' };
	}

	if (requestStatus === 'Pending') {
		return { kind: 'request-pending' };
	}

	if (requestStatus === 'Rejected') {
		return { kind: 'request-rejected' };
	}

	return { kind: 'request' };
}

export { getLockedCta };
export type { LockedCta, LockedCtaContext };
