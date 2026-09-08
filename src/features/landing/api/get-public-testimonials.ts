import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { testimonialSchema } from '@/features/landing/schemas/testimonial.schema';
import type { Testimonial } from '@/features/landing/model/testimonial';

async function getPublicTestimonials(): Promise<Testimonial[]> {
	const data = await apiFetch('/api/testimonials/public');
	return z.array(testimonialSchema).parse(data);
}

export { getPublicTestimonials };
