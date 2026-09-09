import { apiFetch } from '@/lib/http/api-client';
import { testimonialSchema } from '@/features/testimonials/schemas/testimonial.schema';
import type { Testimonial } from '@/features/testimonials/model/testimonial';

type SubmitTestimonialPayload = {
	quote: string;
	courseId: string | null;
};

async function submitTestimonial(
	payload: SubmitTestimonialPayload,
): Promise<Testimonial> {
	const data = await apiFetch('/api/testimonials/mine', {
		method: 'POST',
		body: payload,
	});
	return testimonialSchema.parse(data);
}

export { submitTestimonial };
export type { SubmitTestimonialPayload };
