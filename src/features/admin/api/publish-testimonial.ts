import { apiFetch } from '@/lib/http/api-client';
import { testimonialSchema } from '@/features/admin/schemas/testimonial.schema';
import type { Testimonial } from '@/features/admin/model/testimonial';

async function publishTestimonial(testimonialId: string): Promise<Testimonial> {
	const data = await apiFetch(`/api/testimonials/${testimonialId}/publish`, {
		method: 'POST',
	});
	return testimonialSchema.parse(data);
}

export { publishTestimonial };
