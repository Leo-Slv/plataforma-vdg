import { z } from 'zod';

import { ADDRESS_TOO_LONG_MESSAGE } from '@/features/visitors/lib/first-visit-messages';

// Mirrors CourseCore's Visitor entity + VisitorValidationLimits. Name,
// phone and e-mail carry no per-field messages on purpose: the mockup
// shows one shared message (FORM_INVALID_MESSAGE) for any of them.
const firstVisitFormSchema = z.object({
	name: z.string().trim().min(2).max(200),
	phone: z.string().refine((value) => {
		// Count every digit (not the mask-capped 11) so pasted "+55 ..."
		// numbers fail here instead of at the API.
		const length = value.replace(/\D/g, '').length;
		return length === 10 || length === 11;
	}),
	email: z.string().trim().max(320).email(),
	address: z.string().trim().max(300, ADDRESS_TOO_LONG_MESSAGE),
	captchaToken: z.string(),
});

type FirstVisitFormValues = z.infer<typeof firstVisitFormSchema>;

export { firstVisitFormSchema };
export type { FirstVisitFormValues };
